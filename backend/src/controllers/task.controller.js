const { Task } = require("../models/Task");
const { User } = require("../models/User");
const { Request } = require("../models/Request");
const { Notification } = require("../models/Notification");
const Message = require("../models/Message");
const { cloudinary } = require("../config/cloudinary");

async function uploadToCloudinary(file) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: process.env.CLOUDINARY_FOLDER || "hirehelper/tasks",
        resource_type: "image",
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    stream.end(file.buffer);
  });
}

// ✅ FIXED: camelCase everywhere
async function createTask(req, res) {
  try {
    console.log("REQ BODY:", req.body);
    console.log("REQ FILE:", req.file);
    console.log("REQ USER:", req.user);

    const { title, description, location, startTime, endTime } = req.body;

    if (!title || !location || !startTime) {
      return res.status(400).json({
        success: false,
        message: "Title, Location and Start Time are required",
      });
    }

    const finalEndTime =
      endTime && endTime.trim() !== "" ? endTime : null;

    let pictureUrl = null;
    if (req.file) {
      const uploaded = await uploadToCloudinary(req.file);
      pictureUrl = uploaded.secure_url || uploaded.url;
    }

    const task = await Task.create({
      title,
      description,
      location,
      startTime: startTime,
      endTime: finalEndTime,
      picture: pictureUrl,
      createdBy: req.user?.id,
      sortOrder: 0,
    });

    res.status(201).json({
      success: true,
      message: "Task created successfully",
      data: task,
    });
  } catch (error) {
    console.error("CREATE TASK ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create task",
      error: error.message,
    });
  }
}

async function getMyTasks(req, res) {
  try {
    const tasks = await Task.aggregate([
      { $match: { createdBy: req.user.id } },
      { $addFields: { sortOrder: { $ifNull: ["$sortOrder", 0] } } },
      { $sort: { sortOrder: 1, createdAt: -1 } },
      {
        $lookup: {
          from: "requests",
          localField: "_id",
          foreignField: "task",
          as: "requests",
        },
      },
    ]);

    const helperIds = [
      ...new Set(
        tasks
          .flatMap((task) => (task.requests || []).map((r) => r.helper))
          .filter(Boolean)
      ),
    ];
    const helpers = await User.find({ id: { $in: helperIds } })
      .select("id first_name last_name profile_picture email_id")
      .lean();
    const helpersById = {};
    for (const helper of helpers) {
      helpersById[helper.id] = helper;
    }

    const enrichedTasks = tasks.map((task) => ({
      ...task,
      requests: (task.requests || []).map((r) => ({
        ...r,
        helper: helpersById[r.helper] || { id: r.helper },
      })),
    }));

    res.json({ success: true, data: enrichedTasks });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch tasks" });
  }
}

async function reorderTasks(req, res) {
  try {
    const { taskIds } = req.body || {};

    if (!Array.isArray(taskIds) || taskIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "taskIds array is required",
      });
    }

    const tasks = await Task.find({
      _id: { $in: taskIds },
      createdBy: req.user.id,
    });

    if (tasks.length !== taskIds.length) {
      return res.status(403).json({
        success: false,
        message: "Some tasks not found or not owned by you",
      });
    }

    const updates = taskIds.map((id, index) => ({
      updateOne: {
        filter: { _id: id },
        update: { $set: { sortOrder: index } },
      },
    }));

    await Task.bulkWrite(updates);

    const updated = await Task.find({ createdBy: req.user.id })
      .sort({ sortOrder: 1, createdAt: -1 })
      .populate("requests");

    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to reorder tasks" });
  }
}

// ✅ FIXED
async function updateTaskStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["open", "in_progress", "completed", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      });
    }

    const task = await Task.findOne({ _id: id, createdBy: req.user.id });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found or you don't have permission to update it",
      });
    }

    task.status = status;
    await task.save();

    res.json({
      success: true,
      message: "Task status updated successfully",
      data: task,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to update status" });
  }
}

async function getTaskById(req, res) {
  try {
    const task = await Task.findById(req.params.id).populate("requests");
    if (!task)
      return res.status(404).json({ success: false, message: "Task not found" });
    res.json({ success: true, data: task });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// ✅ FIXED here too
async function updateTask(req, res) {
  try {
    const { id } = req.params;
    const { title, description, location, startTime, endTime } = req.body || {};

    const task = await Task.findOne({ _id: id, createdBy: req.user.id });
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found or you don't have permission to update it",
      });
    }

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (location !== undefined) task.location = location;
    if (startTime !== undefined) task.startTime = startTime;

    if (endTime !== undefined) {
      task.endTime =
        endTime && String(endTime).trim() !== "" ? endTime : null;
    }

    await task.save();

    res.json({
      success: true,
      message: "Task updated successfully",
      data: task,
    });
  } catch (err) {
    console.error("UPDATE TASK ERROR:", err);
    res.status(500).json({ success: false, message: "Failed to update task" });
  }
}

async function updateTaskPicture(req, res) {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const task = await Task.findOne({ _id: id, createdBy: req.user.id });
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found or you don't have permission to update it",
      });
    }

    const uploaded = await uploadToCloudinary(req.file);
    const pictureUrl = uploaded.secure_url || uploaded.url;
    task.picture = pictureUrl;
    await task.save();

    return res.json({
      success: true,
      message: "Task picture updated successfully",
      data: task,
    });
  } catch (err) {
    console.error("UPDATE TASK PICTURE ERROR:", err);
    return res.status(500).json({ success: false, message: "Failed to update task picture" });
  }
}

async function deleteTask(req, res) {
  try {
    const { id } = req.params;

    const task = await Task.findOne({ _id: id, createdBy: req.user.id });
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found or you don't have permission to delete it",
      });
    }

    await Promise.all([
      Task.deleteOne({ _id: id }),
      Request.deleteMany({ task: id }),
      Notification.deleteMany({ taskId: id }),
      Message.deleteMany({ taskId: String(id) }),
    ]);

    const io = req.app.get("io");
    if (io) {
      io.emit("task:deleted", { taskId: String(id) });
    }

    return res.json({
      success: true,
      message: "Task deleted successfully",
      data: { id },
    });
  } catch (err) {
    console.error("DELETE TASK ERROR:", err);
    return res.status(500).json({ success: false, message: "Failed to delete task" });
  }
}

async function getFeedTasks(req, res) {
  try {
    const tasks = await Task.find({ createdBy: { $ne: req.user.id } })
      .sort({ createdAt: -1 })
      .populate("requests")
      .lean();

    const creatorIds = Array.from(
      new Set((tasks || []).map((t) => t.createdBy).filter(Boolean))
    );

    const creators = await User.find({ id: { $in: creatorIds } })
      .select("id first_name last_name profile_picture ratingAvg ratingCount")
      .lean();

    const creatorsById = {};
    for (const u of creators) {
      creatorsById[u.id] = u;
    }

    const tasksWithCreators = tasks.map((t) => ({
      ...t,
      createdBy: creatorsById[t.createdBy] || null,
    }));

    res.json({ success: true, data: tasksWithCreators });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch feed" });
  }
}

module.exports = {
  createTask,
  getMyTasks,
  getTaskById,
  getFeedTasks,
  reorderTasks,
  updateTaskStatus,
  updateTask,
  updateTaskPicture,
  deleteTask,
};
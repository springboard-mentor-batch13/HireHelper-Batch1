const { Task } = require("../models/Task");
const { User } = require("../models/User");
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


async function createTask(req, res) {
  try {
    console.log("REQ BODY:", req.body);
    console.log("REQ FILE:", req.file);
    console.log("REQ USER:", req.user);

    
    const {
      title,
      description,
      location,
      start_time,
      end_time
    } = req.body;

    
    if (!title || !location || !start_time) {
      return res.status(400).json({
        success: false,
        message: "Title, Location and Start Time are required",
      });
    }

    const finalEndTime = end_time && end_time.trim() !== "" ? end_time : null;

    let pictureUrl = null;
    if (req.file) {
      const uploaded = await uploadToCloudinary(req.file);
      pictureUrl = uploaded.secure_url || uploaded.url;
    }

    const task = await Task.create({
      title,
      description,
      location,

      startTime: start_time,
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

    res.json({
      success: true,
      data: tasks,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch tasks",
    });
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

    res.json({
      success: true,
      data: updated,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to reorder tasks",
    });
  }
}


async function getTaskById(req, res) {
  try {
    const task = await Task.findById(req.params.id).populate("requests");
    if (!task)
      return res
        .status(404)
        .json({ success: false, message: "Task not found" });
    res.json({ success: true, data: task });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}
async function getFeedTasks(req, res) {
  try {
    // Fetch tasks not created by the current user
    const tasks = await Task.find({ createdBy: { $ne: req.user.id } })
      .sort({ createdAt: -1 })
      .populate("requests")
      .lean();

    // Collect unique creator IDs
    const creatorIds = Array.from(
      new Set((tasks || []).map((t) => t.createdBy).filter(Boolean))
    );

    // Fetch minimal creator info by their stable UUID `id`
    const creators = await User.find({ id: { $in: creatorIds } })
      .select("id first_name last_name profile_picture")
      .lean();

    const creatorsById = {};
    for (const u of creators) {
      creatorsById[u.id] = u;
    }

    // Attach full creator object onto each task as `createdBy`
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
};
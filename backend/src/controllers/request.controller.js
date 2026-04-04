const { Request } = require("../models/Request");
const { Task } = require("../models/Task");
const { User } = require("../models/User");
const { Notification } = require("../models/Notification");

// Create a new request for a task
async function createRequest(req, res) {
  try {
    const { taskId } = req.body || {};

    if (!taskId) {
      return res.status(400).json({ success: false, message: "taskId is required" });
    }

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    const alreadyAccepted = await Request.findOne({ task: taskId, status: "accepted" });
    if (alreadyAccepted) {
      return res.status(400).json({ success: false, message: "This task already has an accepted helper" });
    }

    const existing = await Request.findOne({ task: taskId, helper: req.user.id });
    if (existing) {
      return res.status(400).json({ success: false, message: "You have already requested this task" });
    }

    const request = await Request.create({ task: taskId, helper: req.user.id });

    // Create notification for task owner
    try {
      const helper = await User.findOne({ id: req.user.id }).select("first_name last_name").lean();
      const helperName = helper ? `${helper.first_name} ${helper.last_name}` : "Someone";
      await Notification.create({
        userId: task.createdBy,
        message: `${helperName} requested to help with "${task.title}"`,
        requestId: request._id,
        taskId: task._id,
      });
    } catch (notifErr) {
      console.error("Notification creation failed:", notifErr);
    }

    const updatedTaskDoc = await Task.findById(taskId).populate("requests").lean();
    let taskWithCreator = updatedTaskDoc;
    if (updatedTaskDoc) {
      const creator = await User.findOne({ id: updatedTaskDoc.createdBy })
        .select("id first_name last_name profile_picture").lean() || null;
      taskWithCreator = { ...updatedTaskDoc, createdBy: creator };
    }

    // Emit real-time notification to task owner via Socket.IO
    try {
      const io = req.app.get("io");
      if (io) {
        const helper = await User.findOne({ id: req.user.id })
          .select("id first_name last_name profile_picture ratingAvg ratingCount")
          .lean();
        io.to(`user:${task.createdBy}`).emit("task:requested", {
          taskId: task._id,
          taskTitle: task.title,
          helper: helper || { id: req.user.id },
        });
      }
    } catch (socketErr) {
      console.error("Socket emit error (task:requested):", socketErr);
    }

    return res.status(201).json({
      success: true,
      message: "Request created successfully",
      data: { request, task: taskWithCreator },
    });
  } catch (err) {
    console.error("CREATE REQUEST ERROR:", err);
    return res.status(500).json({ success: false, message: "Failed to create request" });
  }
}

// GET /api/requests/received — requests on tasks owned by logged in user
async function getReceivedRequests(req, res) {
  try {
    // Find all tasks owned by this user
    const myTasks = await Task.find({ createdBy: req.user.id }).select("_id title picture").lean();
    const myTaskIds = myTasks.map((t) => t._id);
    const taskMap = {};
    for (const t of myTasks) taskMap[String(t._id)] = t;

    // Find all requests for those tasks
    const requests = await Request.find({ task: { $in: myTaskIds } })
      .sort({ createdAt: -1 })
      .lean();

    // Fetch helper info for each request
    const helperIds = [...new Set(requests.map((r) => r.helper).filter(Boolean))];
    const helpers = await User.find({ id: { $in: helperIds } })
      .select("id first_name last_name profile_picture email_id ratingAvg ratingCount").lean();
    const helpersById = {};
    for (const h of helpers) helpersById[h.id] = h;

    const enriched = requests.map((r) => ({
      ...r,
      helper: helpersById[r.helper] || { id: r.helper },
      task: taskMap[String(r.task)] || { _id: r.task },
    }));

    res.json({ success: true, data: enriched });
  } catch (err) {
    console.error("GET RECEIVED REQUESTS ERROR:", err);
    res.status(500).json({ success: false, message: "Failed to fetch received requests" });
  }
}

// GET /api/requests/sent — requests sent by logged in user
async function getSentRequests(req, res) {
  try {
    const requests = await Request.find({ helper: req.user.id })
      .sort({ createdAt: -1 })
      .lean();

    const taskIds = [...new Set(requests.map((r) => r.task).filter(Boolean))];
    const tasks = await Task.find({ _id: { $in: taskIds } }).lean();
    const tasksById = {};
    for (const t of tasks) tasksById[String(t._id)] = t;

    // Fetch creator info for each task
    const creatorIds = [...new Set(tasks.map((t) => t.createdBy).filter(Boolean))];
    const creators = await User.find({ id: { $in: creatorIds } })
      .select("id first_name last_name profile_picture ratingAvg ratingCount").lean();
    const creatorsById = {};
    for (const c of creators) creatorsById[c.id] = c;

    const enriched = requests.map((r) => {
      const task = tasksById[String(r.task)] || { _id: r.task };
      return {
        ...r,
        task: { ...task, createdBy: creatorsById[task.createdBy] || null },
      };
    });

    res.json({ success: true, data: enriched });
  } catch (err) {
    console.error("GET SENT REQUESTS ERROR:", err);
    res.status(500).json({ success: false, message: "Failed to fetch sent requests" });
  }
}

// PATCH /api/requests/:id — accept or decline a request
async function updateRequestStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["accepted", "declined"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Status must be accepted or declined" });
    }

    const request = await Request.findById(id).lean();
    if (!request) {
      return res.status(404).json({ success: false, message: "Request not found" });
    }

    // Verify the task belongs to the logged-in user
    const task = await Task.findOne({ _id: request.task, createdBy: req.user.id });
    if (!task) {
      return res.status(403).json({ success: false, message: "Not authorized to update this request" });
    }

    if (status === "accepted") {
      const alreadyAccepted = await Request.findOne({
        task: request.task,
        status: "accepted",
        _id: { $ne: id },
      });
      if (alreadyAccepted) {
        return res.status(400).json({
          success: false,
          message: "You have already accepted someone for this task",
        });
      }
    }

    const updated = await Request.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    // If accepted, auto-decline pending alternatives and update task assignment
    if (status === "accepted") {
      const otherPending = await Request.find({
        task: request.task,
        status: "pending",
        _id: { $ne: id },
      }).lean();

      if (otherPending.length > 0) {
        await Request.updateMany(
          { task: request.task, status: "pending", _id: { $ne: id } },
          { status: "declined" }
        );

        for (const other of otherPending) {
          try {
            await Notification.create({
              userId: other.helper,
              message: `Your request for "${task.title}" was declined`,
              requestId: other._id,
              taskId: task._id,
            });
          } catch (notifErr) {
            console.error("Notification creation failed:", notifErr);
          }
        }
      }

      await Task.findByIdAndUpdate(request.task, {
        status: "in_progress",
        helperId: request.helper,
      });
    }

    // Notify the helper about accept/decline
    try {
      await Notification.create({
        userId: request.helper,
        message: `Your request for "${task.title}" was ${status}`,
        requestId: request._id,
        taskId: task._id,
      });
    } catch (notifErr) {
      console.error("Notification creation failed:", notifErr);
    }

    res.json({ success: true, message: `Request ${status}`, data: updated });
  } catch (err) {
    console.error("UPDATE REQUEST STATUS ERROR:", err);
    res.status(500).json({ success: false, message: "Failed to update request" });
  }
}

// GET /api/requests/notifications — get notifications for logged in user
async function getNotifications(req, res) {
  try {
    const notifications = await Notification.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();
    res.json({ success: true, data: notifications });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch notifications" });
  }
}

// PATCH /api/requests/notifications/read — mark all notifications as read
async function markNotificationsRead(req, res) {
  try {
    await Notification.updateMany({ userId: req.user.id, read: false }, { read: true });
    res.json({ success: true, message: "Notifications marked as read" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to mark notifications" });
  }
}

module.exports = {
  createRequest,
  getReceivedRequests,
  getSentRequests,
  updateRequestStatus,
  getNotifications,
  markNotificationsRead,
};

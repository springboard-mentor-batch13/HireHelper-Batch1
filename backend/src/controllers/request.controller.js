const { Request } = require("../models/Request");
const { Task } = require("../models/Task");
const { User } = require("../models/User");

// Create a new request for a task
async function createRequest(req, res) {
  try {
    const { taskId } = req.body || {};

    if (!taskId) {
      return res.status(400).json({
        success: false,
        message: "taskId is required",
      });
    }

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Prevent duplicate requests from the same helper for the same task
    const existing = await Request.findOne({
      task: taskId,
      helper: req.user.id,
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "You have already requested this task",
      });
    }

    const request = await Request.create({
      task: taskId,
      helper: req.user.id,
    });

    // Fetch updated task with requests populated so frontend can update counts
    const updatedTaskDoc = await Task.findById(taskId).populate("requests").lean();

    let taskWithCreator = updatedTaskDoc;
    if (updatedTaskDoc) {
      const creator =
        (await User.findOne({ id: updatedTaskDoc.createdBy })
          .select("id first_name last_name profile_picture")
          .lean()) || null;
      taskWithCreator = {
        ...updatedTaskDoc,
        createdBy: creator,
      };
    }

    return res.status(201).json({
      success: true,
      message: "Request created successfully",
      data: {
        request,
        task: taskWithCreator,
      },
    });
  } catch (err) {
    console.error("CREATE REQUEST ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to create request",
    });
  }
}

module.exports = {
  createRequest,
};


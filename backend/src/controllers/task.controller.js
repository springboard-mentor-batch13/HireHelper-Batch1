const { Task } = require("../models/Task");


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

    
    let picturePath = null;
    if (req.file) {
      picturePath = "/uploads/" + req.file.filename;
    }

    
    const task = await Task.create({
      title,
      description,
      location,

    
      startTime: start_time,
      endTime: finalEndTime,

      picture: picturePath,
      createdBy: req.user?.id,
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
    
    const tasks = await Task.find({ createdBy: req.user.id })
      .sort({ createdAt: -1 });

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


async function getTaskById(req, res) {
  try {
    const task = await Task.findById(req.params.id);
    if (!task)
      return res
        .status(404)
        .json({ success: false, message: "Task not found" });
    res.json({ success: true, data: task });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = {
  createTask,
  getMyTasks,
  getTaskById,
};
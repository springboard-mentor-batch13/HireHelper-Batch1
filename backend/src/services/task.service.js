const Task = require("../models/task.model");

const createTask = async (taskData) => {
  return await Task.create(taskData);
};

const getTasksByUser = async (userId) => {
  return await Task.find({ createdBy: userId }).sort({ createdAt: -1 });
};

module.exports = {
  createTask,
  getTasksByUser,
};
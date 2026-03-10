const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true }, // recipient (UUID)
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
    requestId: { type: mongoose.Schema.Types.ObjectId, ref: "Request" },
    taskId: { type: mongoose.Schema.Types.ObjectId, ref: "Task" },
  },
  { timestamps: true }
);

const Notification = mongoose.model("Notification", notificationSchema);
module.exports = { Notification };

const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    taskId: String,
    senderId: String,
    text: String,
    time: String,
    editedAt: Date,
    reactions: [
      {
        userId: { type: String, required: true },
        emoji: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);
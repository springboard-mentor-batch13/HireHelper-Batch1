const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema(
  {
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: true,
      index: true,
    },
    helper: {
      type: String,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "declined"],
      default: "pending",
    },
  },
  { timestamps: true }
);

requestSchema.index({ task: 1, helper: 1 }, { unique: true });

const Request = mongoose.model("Request", requestSchema);
module.exports = { Request };

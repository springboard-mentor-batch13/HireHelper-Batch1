const mongoose = require("mongoose");
const crypto = require("crypto");

const taskSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      default: () => crypto.randomUUID(),
      unique: true,
      index: true,
      immutable: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    location: {
      type: String,
      required: true,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
    },
    createdBy: {
      type: String,
      required: true,
    },
    picture: {
      type: String,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual relation to requests for this task
taskSchema.virtual("requests", {
  ref: "Request",
  localField: "_id",
  foreignField: "task",
});

const Task = mongoose.model("Task", taskSchema);

module.exports = { Task };
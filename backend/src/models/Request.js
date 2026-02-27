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
      // ID of the user who requested to help
      type: String,
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

const Request = mongoose.model("Request", requestSchema);

module.exports = { Request };


const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    reviewerId: {
      type: String,
      required: true,
      index: true,
    },
    revieweeId: {
      type: String,
      required: true,
      index: true,
    },
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

// One review per task from a reviewer to a reviewee
reviewSchema.index({ reviewerId: 1, revieweeId: 1, taskId: 1 }, { unique: true });

const Review = mongoose.model("Review", reviewSchema);
module.exports = { Review };

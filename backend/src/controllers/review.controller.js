const { Review } = require("../models/Review");
const { User } = require("../models/User");
const { Task } = require("../models/Task");

async function createReview(req, res) {
  try {
    const { taskId, rating, comment } = req.body;
    const reviewerId = req.user.id;

    if (!taskId || !rating) {
      return res.status(400).json({ success: false, message: "Task ID and rating are required" });
    }

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    if (task.createdBy !== reviewerId) {
      return res.status(403).json({ success: false, message: "Only the task creator can rate" });
    }

    if (task.status !== "completed") {
      return res.status(400).json({ success: false, message: "Task must be completed before rating" });
    }

    if (!task.helperId) {
      return res.status(400).json({ success: false, message: "No helper assigned to this task" });
    }

    const revieweeId = task.helperId;

    // Check if already reviewed
    const existing = await Review.findOne({ taskId, reviewerId });
    if (existing) {
      return res.status(400).json({ success: false, message: "You have already reviewed this task" });
    }

    const review = await Review.create({
      reviewerId,
      revieweeId,
      taskId,
      rating,
      comment,
    });

    // Update user average rating
    const user = await User.findOne({ id: revieweeId });
    if (user) {
      const oldAvg = user.ratingAvg || 0;
      const oldCount = user.ratingCount || 0;
      const newCount = oldCount + 1;
      const newAvg = (oldAvg * oldCount + rating) / newCount;

      user.ratingAvg = Number(newAvg.toFixed(2));
      user.ratingCount = newCount;
      await user.save();

      // Emit real-time rating update to the user
      const io = req.app.get("io");
      if (io) {
        io.to(`user:${revieweeId}`).emit("rating_updated", {
          ratingAvg: user.ratingAvg,
          ratingCount: user.ratingCount
        });
      }
    }

    res.status(201).json({ success: true, message: "Review submitted successfully", data: review });
  } catch (err) {
    console.error("CREATE REVIEW ERROR:", err);
    res.status(500).json({ success: false, message: "Failed to submit review" });
  }
}

async function getUserReviews(req, res) {
  try {
    const { userId } = req.params;
    const reviews = await Review.find({ revieweeId: userId })
      .sort({ createdAt: -1 })
      .populate("taskId", "title");

    res.json({ success: true, data: reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch reviews" });
  }
}

module.exports = {
  createReview,
  getUserReviews,
};

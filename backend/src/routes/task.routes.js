const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");

const {
  createTask,
  getMyTasks,
  getTaskById,
  getFeedTasks,
  reorderTasks,
  updateTaskStatus,
  updateTask,
  updateTaskPicture,
  deleteTask,
} = require("../controllers/task.controller");

const { requireAuth } = require("../middleware/auth");

router.post("/", requireAuth, upload.single("picture"), createTask);
router.patch("/reorder", requireAuth, reorderTasks);
router.patch("/:id/status", requireAuth, updateTaskStatus); // ← new
router.patch("/:id/picture", requireAuth, upload.single("picture"), updateTaskPicture);
router.get("/feed", requireAuth, getFeedTasks);
router.get("/mine", requireAuth, getMyTasks);
router.patch("/:id", requireAuth, updateTask);
router.delete("/:id", requireAuth, deleteTask);
router.get("/:id", getTaskById);

module.exports = router;

const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");

const { createTask, getMyTasks, getTaskById, getFeedTasks, reorderTasks } = require("../controllers/task.controller");

const { requireAuth } = require("../middleware/auth");

router.post("/", requireAuth, upload.single("picture"), createTask);
router.patch("/reorder", requireAuth, reorderTasks);
router.get("/feed", requireAuth, getFeedTasks);  
router.get("/mine", requireAuth, getMyTasks);
router.get("/:id", getTaskById);

module.exports = router;
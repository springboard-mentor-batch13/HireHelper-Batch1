const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");

const { createTask, getMyTasks, getTaskById, getFeedTasks } = require("../controllers/task.controller");

const { requireAuth } = require("../middleware/auth");

router.post("/", requireAuth, upload.single("picture"), createTask);
router.get("/feed", requireAuth, getFeedTasks);  // must be ABOVE /:id
router.get("/mine", requireAuth, getMyTasks);
router.get("/:id", getTaskById);

module.exports = router;
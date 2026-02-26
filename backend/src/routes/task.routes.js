const express = require("express");
const router = express.Router();
const multer = require("multer");

const {
  createTask,
  getMyTasks,
  getTaskById,
} = require("../controllers/task.controller");

const { requireAuth } = require("../middleware/auth");


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // ensure /uploads exists
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + "-" + file.originalname.replace(/\s+/g, "_"));
  },
});

const upload = multer({ storage });




router.post("/", requireAuth, upload.single("picture"), createTask);


router.get("/mine", requireAuth, getMyTasks);


router.get("/:id", getTaskById);

module.exports = router;
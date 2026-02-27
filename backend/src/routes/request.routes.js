const express = require("express");
const router = express.Router();

const { requireAuth } = require("../middleware/auth");
const { createRequest } = require("../controllers/request.controller");

// Create a new request for a task
router.post("/", requireAuth, createRequest);

module.exports = router;


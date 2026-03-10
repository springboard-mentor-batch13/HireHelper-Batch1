const express = require("express");
const router = express.Router();

const { requireAuth } = require("../middleware/auth");
const {
  createRequest,
  getReceivedRequests,
  getSentRequests,
  updateRequestStatus,
  getNotifications,
  markNotificationsRead,
} = require("../controllers/request.controller");

router.post("/", requireAuth, createRequest);
router.get("/received", requireAuth, getReceivedRequests);
router.get("/sent", requireAuth, getSentRequests);
router.patch("/notifications/read", requireAuth, markNotificationsRead);
router.get("/notifications", requireAuth, getNotifications);
router.patch("/:id", requireAuth, updateRequestStatus);

module.exports = router;

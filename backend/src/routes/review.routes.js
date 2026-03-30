const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/auth");
const { createReview, getUserReviews } = require("../controllers/review.controller");

router.post("/", requireAuth, createReview);
router.get("/user/:userId", getUserReviews);

module.exports = router;

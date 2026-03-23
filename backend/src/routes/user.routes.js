const express = require("express");
const router = express.Router();

const { getMe, updateProfile } = require("../controllers/user.controller");
const { requireAuth } = require("../middleware/auth");
const upload = require("../middleware/upload");

router.get("/me", requireAuth, getMe);

router.post(
  "/update",
  requireAuth,
  (req, res, next) => {
    
    upload.single("profile_picture")(req, res, function (err) {
      if (err) return next(err);
      next();
    });
  },
  updateProfile
);

module.exports = router;
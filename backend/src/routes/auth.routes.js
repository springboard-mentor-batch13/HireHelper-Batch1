const express = require("express");

const {
  register,
  login,
  logout,
  me,
  sendOtp,
  verifyOtp,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
} = require("../controllers/auth.controller");
const { requireAuth } = require("../middleware/auth");

const authRouter = express.Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/logout", logout);

authRouter.post("/otp/send", sendOtp);
authRouter.post("/otp/verify", verifyOtp);

authRouter.post("/forgot-password", forgotPassword);
authRouter.post("/verify-reset-otp", verifyResetOtp);
authRouter.post("/reset-password", resetPassword);

authRouter.get("/me", requireAuth, me);

module.exports = { authRouter };
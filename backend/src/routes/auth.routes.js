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
  generate2FA,
  verify2FA,
  disable2FA,
  verify2FALogin,
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

authRouter.post("/2fa/generate", requireAuth, generate2FA);
authRouter.post("/2fa/enable", requireAuth, verify2FA);
authRouter.post("/2fa/disable", requireAuth, disable2FA);
authRouter.post("/2fa/login/verify", verify2FALogin);

authRouter.get("/me", requireAuth, me);

module.exports = { authRouter };
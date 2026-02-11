const express = require("express");

const { register, login, logout, me, sendOtp, verifyOtp } = require("../controllers/auth.controller");
const { requireAuth } = require("../middleware/auth");

const authRouter = express.Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/logout", logout);

// OTP endpoints (verification can be completed later)
authRouter.post("/otp/send", sendOtp);
authRouter.post("/otp/verify", verifyOtp);

authRouter.get("/me", requireAuth, me);

module.exports = { authRouter };


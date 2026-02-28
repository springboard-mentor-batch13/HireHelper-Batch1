const { User } = require("../models/User");
const { signAuthToken, authCookieOptions } = require("../utils/jwt");
const {
  generateOtpCode,
  hashOtp,
  otpExpiryDate,
} = require("../services/otp.service");
const { sendOtpEmail } = require("../services/email.service");

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());
}

function setAuthCookie(res, userId) {
  const token = signAuthToken({ sub: userId });
  res.cookie("auth_token", token, authCookieOptions());
  return token;
}

async function register(req, res, next) {
  try {
    const {
      first_name,
      last_name,
      phone_number,
      email_id,
      password,
      profile_picture,
    } = req.body || {};

    if (!first_name || !last_name || !phone_number || !email_id || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (!validateEmail(email_id)) {
      return res.status(400).json({ message: "Invalid email" });
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*[^A-Za-z0-9]).{8,}$/;

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters long and include one uppercase letter, one lowercase letter, and one special character.",
      });
    }

    const exists = await User.findOne({
      email_id: String(email_id).toLowerCase().trim(),
    }).lean();

    if (exists) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const user = await User.create({
      first_name,
      last_name,
      phone_number,
      email_id: String(email_id).toLowerCase().trim(),
      password,
      profile_picture: profile_picture || "",
      is_email_verified: false,
    });

    const otp = generateOtpCode();
    user.otp_code_hash = hashOtp(otp);
    user.otp_expires_at = otpExpiryDate(10);
    user.otp_last_sent_at = new Date();
    user.otp_attempts = 0;
    await user.save();

    await sendOtpEmail({ to: user.email_id, code: otp });

    return res.status(201).json({
      message: "Registered. OTP sent.",
      requiresOtp: true,
    });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email_id, password } = req.body || {};

    if (!email_id || !password) {
      return res.status(400).json({ message: "Missing email or password" });
    }

    if (!validateEmail(email_id)) {
      return res.status(400).json({ message: "Invalid email" });
    }

    const user = await User.findOne({
      email_id: String(email_id).toLowerCase().trim(),
    }).select("+password +otp_code_hash");

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (!user.is_email_verified) {
      return res.status(403).json({
        message: "Email not verified. Please verify OTP.",
        requiresOtp: true,
      });
    }

    const token = setAuthCookie(res, user.id);
    return res.json({
      message: "Logged in",
      token,
      user: user.toSafeJSON(),
    });
  } catch (err) {
    next(err);
  }
}

async function logout(req, res) {
  res.clearCookie("auth_token", authCookieOptions());
  return res.json({ message: "Logged out" });
}

async function me(req, res) {
  return res.json({ user: req.user });
}

async function sendOtp(req, res, next) {
  try {
    const { email_id } = req.body || {};

    if (!email_id || !validateEmail(email_id)) {
      return res.status(400).json({ message: "Invalid email" });
    }

    const user = await User.findOne({
      email_id: String(email_id).toLowerCase().trim(),
    }).select("+otp_code_hash");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (
      user.otp_last_sent_at &&
      Date.now() - user.otp_last_sent_at.getTime() < 60000
    ) {
      return res
        .status(429)
        .json({ message: "Please wait before requesting another OTP" });
    }

    const otp = generateOtpCode();
    user.otp_code_hash = hashOtp(otp);
    user.otp_expires_at = otpExpiryDate(10);
    user.otp_last_sent_at = new Date();
    user.otp_attempts = 0;
    await user.save();

    await sendOtpEmail({ to: user.email_id, code: otp });

    return res.json({ message: "OTP sent" });
  } catch (err) {
    next(err);
  }
}

async function verifyOtp(req, res, next) {
  try {
    const { email_id, code } = req.body || {};

    if (!email_id || !validateEmail(email_id)) {
      return res.status(400).json({ message: "Invalid email" });
    }

    if (!code || String(code).length !== 4) {
      return res.status(400).json({ message: "Invalid code" });
    }

    const user = await User.findOne({
      email_id: String(email_id).toLowerCase().trim(),
    }).select("+otp_code_hash");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (hashOtp(String(code)) !== user.otp_code_hash) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    user.is_email_verified = true;
    user.otp_code_hash = "";
    user.otp_expires_at = null;
    user.otp_attempts = 0;
    await user.save();

    const token = setAuthCookie(res, user.id);

    return res.json({
      message: "OTP verified",
      token,
      user: user.toSafeJSON(),
    });
  } catch (err) {
    next(err);
  }
}

// ─── Forgot Password ──────────────────────────────────────────────────────────

async function forgotPassword(req, res, next) {
  try {
    const { email_id } = req.body || {};

    if (!email_id || !validateEmail(email_id)) {
      return res.status(400).json({ message: "Invalid email" });
    }

    const user = await User.findOne({
      email_id: String(email_id).toLowerCase().trim(),
    }).select("+otp_code_hash");

    if (!user) {
      // Don't reveal if email exists or not for security
      return res.json({ message: "If this email exists, an OTP has been sent." });
    }

    if (
      user.otp_last_sent_at &&
      Date.now() - user.otp_last_sent_at.getTime() < 60000
    ) {
      return res.status(429).json({ message: "Please wait before requesting another OTP" });
    }

    const otp = generateOtpCode();
    user.otp_code_hash = hashOtp(otp);
    user.otp_expires_at = otpExpiryDate(10);
    user.otp_last_sent_at = new Date();
    user.otp_attempts = 0;
    await user.save();

    await sendOtpEmail({ to: user.email_id, code: otp });

    return res.json({ message: "OTP sent to your email" });
  } catch (err) {
    next(err);
  }
}

async function verifyResetOtp(req, res, next) {
  try {
    const { email_id, code } = req.body || {};

    if (!email_id || !validateEmail(email_id)) {
      return res.status(400).json({ message: "Invalid email" });
    }

    if (!code || String(code).length !== 4) {
      return res.status(400).json({ message: "Invalid code" });
    }

    const user = await User.findOne({
      email_id: String(email_id).toLowerCase().trim(),
    }).select("+otp_code_hash");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (hashOtp(String(code)) !== user.otp_code_hash) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // OTP is valid but don't clear it yet — needed for reset-password step
    return res.json({ message: "OTP verified. Proceed to reset password." });
  } catch (err) {
    next(err);
  }
}

async function resetPassword(req, res, next) {
  try {
    const { email_id, code, new_password } = req.body || {};

    if (!email_id || !validateEmail(email_id)) {
      return res.status(400).json({ message: "Invalid email" });
    }

    if (!code || String(code).length !== 4) {
      return res.status(400).json({ message: "Invalid code" });
    }

    if (!new_password || new_password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }

    const user = await User.findOne({
      email_id: String(email_id).toLowerCase().trim(),
    }).select("+otp_code_hash +password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (hashOtp(String(code)) !== user.otp_code_hash) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Update password and clear OTP
    user.password = new_password;
    user.otp_code_hash = "";
    user.otp_expires_at = null;
    await user.save();

    return res.json({ message: "Password reset successfully" });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  register,
  login,
  logout,
  me,
  sendOtp,
  verifyOtp,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
};

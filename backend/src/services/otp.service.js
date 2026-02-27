const crypto = require("crypto");

function generateOtpCode() {
  
  const code = String(Math.floor(1000 + Math.random() * 9000));
  return code;
}

function hashOtp(code) {
  const pepper = process.env.OTP_PEPPER || "adahkshdkaskfknk";
  if (!pepper) throw new Error("Missing OTP_PEPPER");
  return crypto.createHash("sha256").update(`${pepper}:${code}`).digest("hex");
}

function otpExpiryDate(minutes = 10) {
  return new Date(Date.now() + minutes * 60 * 1000);
}

module.exports = { generateOtpCode, hashOtp, otpExpiryDate };


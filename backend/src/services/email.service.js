const nodemailer = require("nodemailer");

function smtpConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

function getTransport() {
  const port = Number(process.env.SMTP_PORT || 587);
  const secure = String(process.env.SMTP_SECURE || "false").toLowerCase() === "true";

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

async function sendOtpEmail({ to, code }) {

  if (!smtpConfigured()) {
    // eslint-disable-next-line no-console
    console.log(`[DEV OTP] Email to ${to}: ${code}`);
    return;
  }

  const transport = getTransport();
  const from = process.env.SMTP_FROM || "no-reply@hirehelper.local";

  await transport.sendMail({
    from,
    to,
    subject: "Your HireHelper verification code",
    text: `Your verification code is: ${code}`,
  });
}

module.exports = { sendOtpEmail };


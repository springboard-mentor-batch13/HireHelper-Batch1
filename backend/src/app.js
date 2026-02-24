const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const { authRouter } = require("./routes/auth.routes");
const { notFoundHandler, errorHandler } = require("./middleware/errors");

function createApp() {
  const app = express();

  const corsOrigin = process.env.CORS_ORIGIN || "http://localhost:5173";
  app.use(cors({ origin: corsOrigin, credentials: true }));

  app.use(express.json({ limit: "1mb" }));
  app.use(cookieParser());

  app.get("/health", (req, res) => res.json({ ok: true }));

  app.use("/api/auth", authRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
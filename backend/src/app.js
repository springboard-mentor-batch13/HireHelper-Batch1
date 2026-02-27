const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const { authRouter } = require("./routes/auth.routes");
const taskRouter = require("./routes/task.routes");
const requestRouter = require("./routes/request.routes");
const { notFoundHandler, errorHandler } = require("./middleware/errors");

function createApp() {
  const app = express();

  const corsOrigin = process.env.CORS_ORIGIN || "http://localhost:5173";

  // CORS middleware
  app.use(
    cors({
      origin: corsOrigin,
      credentials: true,
    })
  );

  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true }));

  app.use(cookieParser());

  // Health check endpoint
  app.get("/health", (req, res) => res.json({ ok: true }));

  app.use("/api/auth", authRouter);
  app.use("/api/tasks", taskRouter);
  app.use("/api/requests", requestRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const { authRouter } = require("./routes/auth.routes");
const taskRouter = require("./routes/task.routes");
const requestRouter = require("./routes/request.routes");
const { notFoundHandler, errorHandler } = require("./middleware/errors");
const userRoutes = require("./routes/user.routes");
const reviewRouter = require("./routes/review.routes");


const app = express();

const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:5173")
  .split(",")
  .map(o => o.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
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
app.use("/api/user", userRoutes);

const chatRoutes = require("./routes/chatRoutes");
app.use("/api/chat", chatRoutes);
app.use("/api/reviews", reviewRouter);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
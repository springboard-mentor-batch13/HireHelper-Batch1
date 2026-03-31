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

const defaultOrigins = ["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"];
const allowedOrigins = [...new Set([
  ...(process.env.CORS_ORIGIN || "").split(","),
  ...defaultOrigins
])].map(o => o.trim()).filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        const error = new Error(`Origin ${origin} not allowed by CORS`);
        error.statusCode = 403;
        callback(error);
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

// Deployment status verification
app.get("/", (req, res) => res.json({ 
  name: "HireHelper API", 
  status: "Online", 
  version: "1.0.1",
  environment: process.env.NODE_ENV || "development"
}));

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
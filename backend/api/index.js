const mongoose = require("mongoose");
const { connectDb } = require("../src/config/db");
const app = require("../src/app");

let cachedApp = null;

module.exports = async (req, res) => {
  try {
    // Only connect if not already connected (0 = disconnected, 1 = connected)
    if (mongoose.connection.readyState === 0) {
      await connectDb(process.env.MONGO_URI);
    }
    
    if (!cachedApp) {
      cachedApp = app;
    }
    
    // Express app is just a (req, res) handler
    return cachedApp(req, res);
  } catch (error) {
    console.error("Vercel Invocation Error:", error);
    res.status(500).json({ 
      error: "Internal Server Error", 
      message: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined
    });
  }
};

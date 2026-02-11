const mongoose = require("mongoose");

async function connectDb(uri) {
  if (!uri) {
    throw new Error("Missing MONGO_URI");
  }

  mongoose.set("strictQuery", true);
  await mongoose.connect(uri);

  // eslint-disable-next-line no-console
  console.log("Connected to MongoDB");
}

module.exports = { connectDb };


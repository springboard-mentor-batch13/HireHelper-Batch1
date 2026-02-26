const path = require("path");

require("dotenv").config({
  path: path.join(__dirname, "..", ".env"),
});

const { createApp } = require("./app");
const { connectDb } = require("./config/db");

async function main() {
  await connectDb(process.env.MONGO_URI);

  const app = createApp();

  app.use("/uploads", require("express").static(path.join(__dirname, "..", "uploads")));

  const port = Number(process.env.PORT || 5000);

  app.listen(port, () => {
    console.log(`Backend listening on http://localhost:${port}`);
    console.log("Uploads available at: http://localhost:" + port + "/uploads/<filename>");
  });
}

main().catch((err) => {
  console.error("Fatal startup error:", err);
  process.exit(1);
});
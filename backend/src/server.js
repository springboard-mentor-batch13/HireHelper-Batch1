const path = require("path");

require("dotenv").config({
  path: path.join(__dirname, "..", ".env"),
});

const { createApp } = require("./app");
const { connectDb } = require("./config/db");

async function main() {
  await connectDb(process.env.MONGO_URI);

  const app = createApp();

  const port = Number(process.env.PORT || 5000);

  app.listen(port, () => {
    console.log(`Backend listening on http://localhost:${port}`);
  });
}

main().catch((err) => {
  console.error("Fatal startup error:", err);
  process.exit(1);
});
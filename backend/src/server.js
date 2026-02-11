const path = require("path");

// Always load backend/.env, regardless of where node/nodemon is run from
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
    // eslint-disable-next-line no-console
    console.log(`Backend listening on http://localhost:${port}`);
  });
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("Fatal startup error:", err);
  process.exit(1);
});


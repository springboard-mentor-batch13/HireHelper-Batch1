const multer = require("multer");

// Use in‑memory storage; files are sent directly to Cloudinary
const storage = multer.memoryStorage();

const upload = multer({ storage });

module.exports = upload;
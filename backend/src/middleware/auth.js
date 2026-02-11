const { verifyAuthToken } = require("../utils/jwt");
const { User } = require("../models/User");

async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const bearer = header.startsWith("Bearer ") ? header.slice(7) : null;
    const cookieToken = req.cookies ? req.cookies.auth_token : null;
    const token = bearer || cookieToken;

    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = verifyAuthToken(token);
    const user = await User.findOne({ id: decoded.sub }).lean();

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized" });
  }
}

module.exports = { requireAuth };


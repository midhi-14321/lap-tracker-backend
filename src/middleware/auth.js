const dotenv = require("dotenv");
dotenv.config();
const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) return res.status(401).json({ error: "Loggin required " });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
};

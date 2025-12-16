const jwt = require("jsonwebtoken");
require("dotenv").config();

const jwtAuthMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({
      error: "Please provide access token",
    });
  }

  // Verifying token
  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({
      error: "Invalid token format",
    });
  }

  try {
    const decodedPayload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.user = decodedPayload;
    next();
  } catch (err) {
    return res.status(401).json({
      error: "Authentication Failed",
    });
  }
};

const generateAccessToken = (payload) => {
  return jwt.sign({ payload }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: "15m",
  });
};

const generateRefreshToken = (payload) => {
  return jwt.sign({ payload }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "15d",
  });
};

module.exports = {
  generateAccessToken,
  jwtAuthMiddleware,
  generateRefreshToken,
};

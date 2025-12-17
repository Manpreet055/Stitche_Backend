const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const mongoose = require("mongoose");
const authMiddleware = (req, res, next) => {
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

const getNewAccessToken = (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ msg: "Refresh token missing" });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const accessToken = generateAccessToken(decoded.payload);

    res.status(200).json({ token: accessToken });
  } catch (err) {
    res.status(401).json({ msg: "Invalid or expired refresh token" });
  }
};

module.exports = {
  generateAccessToken,
  authMiddleware,
  generateRefreshToken,
  getNewAccessToken,
};

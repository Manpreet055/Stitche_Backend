const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

exports.authMiddleware = (req, res, next) => {
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
  } catch (error) {
    return res.status(401).json({
      error: "Authentication Failed ",
    });
  }
};

exports.generateAccessToken = (payload) => {
  return jwt.sign({ payload }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
  });
};

exports.generateRefreshToken = (payload) => {
  return jwt.sign({ payload }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
  });
};

exports.getNewAccessToken = async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ msg: "Refresh token missing" });
  }

  try {
    // 1) Verify token signature/expiry first
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // 2) Find user who has this refresh token in their array
    const user = await User.findOne({ refreshToken });

    // 3) CHECK if user exists BEFORE accessing user.refreshToken
    if (!user) {
      return res.status(403).json({ msg: "Refresh token is invalid." });
    }

    // 4) Extra check: ensure token is still in the array (token rotation safety)
    if (!user.refreshToken.includes(refreshToken)) {
      return res.status(403).json({ msg: "Refresh token is used or invalid." });
    }

    // 5) Generate new access token
    const accessToken = exports.generateAccessToken(decoded.payload);
    return res.status(200).json({ token: accessToken });
  } catch (err) {
    // jwt.verify throws if token is expired/invalid
    return res.status(403).json({ msg: "Invalid or expired refresh token" });
  }
};

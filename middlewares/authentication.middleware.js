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
      error: "Authentication Failed " + error.message,
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
  let user;
  try {
    user = await User.findOne({ refreshToken });
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    if (!user.refreshToken.includes(refreshToken)) {
      return res.status(403).json({
        msg: "Refresh token is used or invalid.",
      });
    }
    const accessToken = generateAccessToken(decoded.payload);
    res.status(200).json({ token: accessToken });
  } catch (err) {
    if (user) {
      user.refreshToken = user.refreshToken.filter(
        (token) => token !== refreshToken,
      );
      await user.save();
    }
    res.status(403).json({ msg: "Invalid or expired refresh token" });
    throw err;
  }
};

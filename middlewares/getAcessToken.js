const jwt = require("jsonwebtoken");
const { generateAccessToken } = require("./jwtAuthMiddleware");

const getAccessToken = (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

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

module.exports = getAccessToken;

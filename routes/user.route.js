const express = require("express");
const {
  handleLogin,
  handleSignup,
  handleLogoutUser,
  handleGetUserById,
} = require("../controllers/user.controller");

const {
  getNewAccessToken,
  authMiddleware,
} = require("../middlewares/auth.middleware");

const router = express.Router();

router.route("/").get(authMiddleware, handleGetUserById);
router.post("/logout", authMiddleware, handleLogoutUser);
router.post("/login", handleLogin);
router.post("/signup", handleSignup);
router.post("/refresh-token", getNewAccessToken);

module.exports = router;

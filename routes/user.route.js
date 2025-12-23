const express = require("express");
const {
  handleLogin,
  handleSignup,
  handleLogoutUser,
  handleGetUserById,
  handleSubscribeNewLetter,
} = require("../controllers/user.controller");
const asyncHandler = require("../utils/asyncHandler");
const {
  getNewAccessToken,
  authMiddleware,
} = require("../middlewares/auth.middleware");

const router = express.Router();
router.route("/").get(authMiddleware, asyncHandler(handleGetUserById));
router.post("/logout", authMiddleware, asyncHandler(handleLogoutUser));
router.post("/login", asyncHandler(handleLogin));
router.post("/signup", handleSignup);
router.post("/refresh-token", asyncHandler(getNewAccessToken));
router.patch("/subscirbe", asyncHandler(handleSubscribeNewLetter));

module.exports = router;

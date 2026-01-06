const express = require("express");
const {
  handleLogin,
  handleSignup,
  handleLogoutUser,
  handleGetUserById,
  handleSubscribeNewLetter,
  updateUserProfile,
} = require("../controllers/user.controller");
const asyncHandler = require("../utils/asyncHandler");
const {
  getNewAccessToken,
  authMiddleware,
} = require("../middlewares/authentication.middleware");
const { handleProfileImage } = require("../middlewares/multer.middleware");

const router = express.Router();
router.route("/").get(authMiddleware, asyncHandler(handleGetUserById));
router.post("/logout", authMiddleware, asyncHandler(handleLogoutUser));
router.post("/login", asyncHandler(handleLogin));
router.post("/signup", asyncHandler(handleSignup));
router.post("/refresh-token", asyncHandler(getNewAccessToken));
router.patch(
  "/subscribe",
  authMiddleware,
  asyncHandler(handleSubscribeNewLetter),
);
router.patch(
  "/update-profile",
  authMiddleware,
  handleProfileImage,
  asyncHandler(updateUserProfile),
);

module.exports = router;

const express = require("express");
const { authMiddleware } = require("../middlewares/auth.middleware");
const {
  handleGetMessageDataById,
  handleDeleteMessageById,
  handleCreateMessage,
} = require("../controllers/inbox.controller");
const asyncHandler = require("../utils/asyncHandler");
const router = express.Router();

router
  .route("/:id")
  .get(authMiddleware, asyncHandler(handleGetMessageDataById))
  .delete(asyncHandler(authMiddleware, handleDeleteMessageById));

router.route("/").post(authMiddleware, handleCreateMessage);

module.exports = router;

const express = require("express");
const { authMiddleware } = require("../middlewares/authentication.middleware");
const {
  handleGetMessageDataById,
  handleDeleteMessageById,
  handleCreateMessage,
} = require("../controllers/inbox.controller");
const asyncHandler = require("../utils/asyncHandler");
const router = express.Router();
const { verifyAdmin } = require("../middlewares/authorization.middleware");

router
  .route("/:id")
  .get(authMiddleware, asyncHandler(handleGetMessageDataById))
  .delete(authMiddleware, verifyAdmin, handleDeleteMessageById);

router.route("/").post(authMiddleware, handleCreateMessage);

module.exports = router;

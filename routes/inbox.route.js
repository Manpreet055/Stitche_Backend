const express = require("express");
const { authMiddleware } = require("../middlewares/auth.middleware");
const {
  handleGetMessageDataById,
  handleDeleteMessageById,
} = require("../controllers/inbox.controller");
const asyncHandler = require("../utils/asyncHandler");
const router = express.Router();

router
  .route("/:id")
  .get(asyncHandler(handleGetMessageDataById))
  .delete(asyncHandler(handleDeleteMessageById));

module.exports = router;

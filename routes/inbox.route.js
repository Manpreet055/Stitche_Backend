const express = require("express");
const { authMiddleware } = require("../middlewares/auth.middleware");
const {
  handleGetMessageDataById,
  handleDeleteMessageById,
} = require("../controllers/inbox.controller");

const router = express.Router();

router
  .route("/:id")
  .get(handleGetMessageDataById)
  .delete(handleDeleteMessageById);

module.exports = router;

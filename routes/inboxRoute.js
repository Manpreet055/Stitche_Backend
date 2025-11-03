const express = require("express");
const {
  handleGetAllMessages,
  findChatById,
  handleSearchInbox,
} = require("../controllers/inboxControllers");

const router = express.Router();

router.get("/", handleGetAllMessages);
router.get("/search", handleSearchInbox);
router.get("/:id", findChatById);

module.exports = router;

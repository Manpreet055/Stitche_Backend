const express = require("express");
const {
  handleGetAllMessages,
  findChatById,
} = require("../controllers/inboxControllers");

const router = express.Router();

router.get("/", handleGetAllMessages);
router.get("/:id", findChatById);
module.exports = router;

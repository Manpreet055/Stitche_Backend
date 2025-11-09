const express = require("express");
const {
  handleGetAllMessages,
  findChatById,
  filterInbox,
} = require("../controllers/inboxControllers");

const router = express.Router();

router.get("/", handleGetAllMessages);
router.get("/filter", filterInbox);
router.get("/:id", findChatById);
module.exports = router;

const express = require("express");
const {
  handleGetAllMessages,
  findChatById,
  filterInbox,
} = require("../controllers/inboxControllers");

const router = express.Router();

router.get("/", handleGetAllMessages);
router.get("/:id", findChatById);
router.get("/filter", filterInbox);
module.exports = router;

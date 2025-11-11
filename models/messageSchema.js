const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({});

const Inbox = mongoose.model("message", messageSchema);

module.exports = Inbox;

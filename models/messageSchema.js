const mongoose = require("mongoose");

const textSchema = new mongoose.Schema(
  {
    sender: { type: String, required: true },
    text: { type: String, required: true },
    attachments: [String],
    isRead: { type: Boolean, default: false },
  },
  { _id: false, timestamps: true },
);

const messageSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    subject: { type: String, required: true },
    label: { type: [String], required: true },
    isStarred: { type: Boolean, default: false },
    messages: [textSchema],
  },
  { timestamps: true },
);

const Inbox = mongoose.model("Message", messageSchema);
module.exports = Inbox;

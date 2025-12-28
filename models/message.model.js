const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: [true, "Please provide your name"],
      trim: true,
      maxLength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Please provide your email"],
      lowercase: true,
    },
    subject: {
      type: String,
      required: [true, "Please specify a subject"],
      enum: {
        values: [
          "General Inquiry",
          "Order Issue",
          "Technical Support",
          "Feedback",
          "Other",
        ],
        message: "{VALUE} is not a valid category",
      },
    },
    message: {
      type: String,
      required: [true, "Message content is required"],
      minLength: [10, "Message must be at least 10 characters long"],
      maxLength: [1000, "Message cannot exceed 1000 characters"],
    },
    status: {
      type: String,
      enum: ["New", "In Progress", "Resolved"],
      default: "New",
    },
  },
  { timestamps: true },
);

const Inbox = mongoose.model("Message", messageSchema);
module.exports = Inbox;

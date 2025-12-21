const mongoose = require("mongoose");
const Inbox = require("../models/message.model");

exports.handleGetMessageDataById = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      status: 0,
      msg: "Message id is not valid",
    });
  }

  const foundMessages = await Inbox.findById(id).lean();

  if (!foundMessages) {
    return res.status(404).json({
      status: 0,
      msg: "Messages not found",
    });
  }
  res.status(200).json({
    status: 1,
    msg: "Messages fetching Successful",
    data: foundMessages,
  });
};

exports.handleDeleteMessageById = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      status: 0,
      msg: "Message id is not valid",
    });
  }

  const deleteMessage = await Inbox.findByIdAndDelete(id);

  if (!deleteMessage) {
    return res.status(404).json({
      status: 0,
      msg: "No Message found",
    });
  }

  res.status(200).json({
    status: 1,
    msg: "Data deleted successfully.",
    data: deleteMessage,
  });
};

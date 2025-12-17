const mongoose = require("mongoose");
const Inbox = require("../models/message.model");

const handleGetMessageDataById = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      status: 0,
      msg: "Message id is not valid",
    });
  }

  try {
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
  } catch (error) {
    res.status(500).json({
      status: 0,
      msg: error.message,
    });
  }
};

const handleDeleteMessageById = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      status: 0,
      msg: "Message id is not valid",
    });
  }

  try {
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
  } catch (error) {
    res.status(500).json({
      status: 0,
      msg: error.message,
    });
  }
};
module.exports = {
  handleGetMessageDataById,
  handleDeleteMessageById,
};

const { ObjectId } = require("mongodb");
const Inbox = require("../models/messageSchema");

const handleGetAllMessages = async (req, res) => {
  try {
    let { limit, page } = req.query;
    limit = parseInt(limit) || 10;
    page = parseInt(page) || 1;
    const skip = (page - 1) * limit;
    const length = await Inbox.countDocuments();
    const totalPages = Math.ceil(length / limit);

    const allMessages = await Inbox.find({})
      .sort({ conversationId: 1, _id: 1 })
      .skip(skip)
      .limit(limit)
      .lean();

    res.status(200).json({
      status: 1,
      msg: "Data fetched successfully ",
      totalPages: totalPages,
      messages: allMessages,
    });
  } catch (error) {
    res.status(500).json({
      status: 0,
      msg: `Server Error : ${error.message}`,
    });
  }
};

const findChatById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      res.status(400).json({
        status: 0,
        msg: "Chat Id is not valid",
      });
    }

    const foundChat = await Inbox.findById(id).lean();

    if (!foundChat) {
      res.status(404).json({
        status: 0,
        msg: "Chat not found",
      });
    }
    res.status(200).json({
      status: 1,
      msg: "Data fetching Successful",
      chat: foundChat,
    });
  } catch (error) {
    res.status(500).json({
      status: 0,
      msg: `Server Error :${error.message}`,
    });
  }
};

module.exports = { handleGetAllMessages, findChatById };

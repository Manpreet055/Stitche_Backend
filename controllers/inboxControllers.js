const { ObjectId } = require("mongodb");
const { connectMongoDB } = require("../config/connectMongoDB");

const handleGetAllMessages = async (req, res) => {
  try {
    const Inbox = await connectMongoDB("inbox");
    let { limit, page } = req.query;
    limit = parseInt(limit) || 10;
    page = parseInt(page) || 1;
    const skip = (page - 1) * limit;
    const length = await Inbox.find().count();
    const totalPages = Math.ceil(length / limit);

    const allMessages = await Inbox.find()
      .sort({ conversationId: 1, _id: 1 })
      .skip(skip)
      .limit(limit)
      .toArray();

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

    const Inbox = await connectMongoDB("inbox");
    const foundChat = await Inbox.findOne({ _id: new ObjectId(id) });

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

const handleSearchInbox = async (req, res) => {
  try {
    const Inbox = await connectMongoDB("inbox");
    const { query, limit } = req.query;

    if (!query) {
      return res.status(400).json({
        status: 0,
        msg: "Search query is required",
      });
    }

    const searchResults = await Inbox.aggregate([
      {
        $search: {
          index: "inbox",
          text: {
            query: query,
            path: [
              "conversationId",
              "user.email",
              "user.name",
              "user.id",
              "role",
              "subject",
            ],
            fuzzy: { maxEdits: 2 },
          },
        },
      },
      { $limit: limit || 10 },
    ]).toArray();

    res.status(200).json({
      status: 1,
      msg: "Data fetched successfully",
      inbox: searchResults,
    });
  } catch (error) {
    res.status(500).json({
      status: 0,
      msg: `Server Error: ${error.message}`,
    });
  }
};
module.exports = { handleGetAllMessages, findChatById,handleSearchInbox };

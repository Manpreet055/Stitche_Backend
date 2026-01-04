const mongoose = require("mongoose");
const Inbox = require("../models/message.model");
const User = require("../models/user.model");
const ApiError = require("../utils/ApiError");

exports.handleGetMessageDataById = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError("Message id is not valid", 400);
  }

  const foundMessages = await Inbox.findById(id).lean();
  if (!foundMessages) {
    throw new ApiError("Message not found", 404);
  }
  res.status(200).json({
    status: 1,
    msg: "Messages fetching Successful",
    data: foundMessages,
  });
};

exports.handleDeleteMessageById = async (req, res) => {
  const { id } = req.params; //messageId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError("Message id is not valid", 400);
  }

  // using sessions
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const findMessage = await Inbox.findById(id).lean().session(session);
    if (!findMessage) {
      throw new ApiError("Message not found", 404);
    }

    await User.findByIdAndUpdate(
      { _id: findMessage?.user },
      {
        $pull: { messages: id },
      },
      { session },
    ).lean();

    const deleteMessage = await Inbox.findByIdAndDelete(id, { session }).lean();
    await session.commitTransaction();

    res.status(200).json({
      status: 1,
      msg: "Message deleted successfully.",
      deleteMessage,
    });
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    res.status(error.statusCode || 500).json({
      status: 0,
      msg: "Transaction failed: " + error.message,
    });
  } finally {
    await session.endSession();
  }
};

exports.handleCreateMessage = async (req, res) => {
  const { id } = req.user.payload;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError("User is is not valid", 400);
  }

  const message = req.body;
  if (!message || Object.keys(message).length === 0) {
    throw new ApiError("Please provide message details");
  }
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const newMessage = await Inbox.create([message], { session });
    if (!newMessage) {
      throw new ApiError("Message is not created..", 400);
    }
    await User.findByIdAndUpdate(
      id,
      {
        $push: { messages: newMessage[0]._id },
      },
      { session },
    ).lean();

    // saving transactions and sending response
    await session.commitTransaction();
    res.status(201).json({
      status: 1,
      msg: "Message Created",
      newMessage,
    });
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    res.status(error.statusCode || 500).json({
      status: 0,
      msg: error.message,
    });
  } finally {
    await session.endSession();
  }
};

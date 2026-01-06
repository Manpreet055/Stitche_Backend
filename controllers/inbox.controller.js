const mongoose = require("mongoose");
const Inbox = require("../models/message.model");
const User = require("../models/user.model");
const ApiError = require("../utils/ApiError");

exports.handleGetMessageDataById = async (req, res) => {
  const { id: userId, role } = req.user.payload;
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError("User id is not valid", 400);
  }

  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError("Message id is not valid", 400);
  }

  const userRecord = await User.findById(userId).lean();
  if (!userRecord) {
    throw new ApiError("User not found", 404);
  }

  // check whether the message belongs to the user or the user is admin
  if (!userRecord.messages.includes(id) && role !== "admin") {
    throw new ApiError("You are not authorized to access this message", 403);
  }

  //if all good then fetch the message
  const foundMessages = await Inbox.findById(id).lean();
  if (!foundMessages) {
    throw new ApiError("Message not found", 404);
  }

  // if found then send response
  res.status(200).json({
    status: 1,
    msg: "Messages fetching Successful",
    data: foundMessages,
  });
};

exports.handleDeleteMessageById = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError("Message id is not valid", 400);
  }

  // start a session for transaction
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    // check if message exists
    const findMessage = await Inbox.findById(id).lean().session(session);
    if (!findMessage) {
      throw new ApiError("Message not found", 404);
    }

    // remove message reference from user messages array
    await User.findByIdAndUpdate(
      { _id: findMessage?.user },
      {
        $pull: { messages: id },
      },
      { session },
    ).lean();

    //if all good then delete the message
    const deleteMessage = await Inbox.findByIdAndDelete(id, { session }).lean();
    await session.commitTransaction();

    res.status(200).json({
      status: 1,
      msg: "Message deleted successfully.",
      deleteMessage,
    });
  } catch (error) {
    // abort transaction on error
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    res.status(error.statusCode || 500).json({
      status: 0,
      msg: "Transaction failed: " + error.message,
    });
  } finally {
    await session.endSession(); // end session
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

    // adding message reference to user messages array
    await User.findByIdAndUpdate(
      id,
      {
        $push: { messages: newMessage[0]._id },
      },
      { session },
    ).lean();

    // if all good then commit transaction
    await session.commitTransaction();
    res.status(201).json({
      status: 1,
      msg: "Message Created",
      newMessage,
    });
  } catch (error) {
    // abort transaction on error
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    res.status(error.statusCode || 500).json({
      status: 0,
      msg: error.message,
    });
  } finally {
    await session.endSession(); // end session
  }
};

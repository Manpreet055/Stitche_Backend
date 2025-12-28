const mongoose = require("mongoose");
const Order = require("../models/order.model");
const User = require("../models/user.model");

exports.handleGetOrderDataById = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      status: 0,
      msg: "Order id is not valid",
    });
  }

  const orders = await Order.findById(id)
    .populate("products.product")
    .populate("user", "profile.fullName");

  if (!orders) {
    return res.status(404).json({
      status: 0,
      msg: "Order data not found",
    });
  }

  res.status(200).json({
    status: 1,
    msg: "Data fetching Successful",
    orders,
  });
};

exports.handleDeleteOrderById = async (req, res) => {
  const { id } = req.params; //orderId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error("Order id is not valid");
    error.statusCode = 404;
    throw error;
  }

  // using sessions
  const session = await mongoose.startSession();

  try {
    session.startTransaction();
    // finding order and updating the user document
    const findOrder = await Order.findById(id).session(session);

    if (!findOrder) {
      await session.abortTransaction();
      session.endSession();
      const error = new Error("Order not found");
      error.statusCode = 404;
      throw error;
    }

    await User.findByIdAndUpdate(
      { _id: findOrder?.user },
      {
        $pull: { orders: id },
      },
      { session },
    );

    // deleting the order id from orders collection
    const deleteOrder = await Order.findByIdAndDelete(id, { session });
    await session.commitTransaction();

    res.status(200).json({
      status: 1,
      msg: "Data deleted successfully.",
      deleteOrder,
    });
  } catch (error) {
    session.abortTransaction();
    res.status(error.statusCode || 500).json({
      status: 0,
      msg: "Transaction failed: " + error.message,
    });
  } finally {
    session.endSession();
  }
};

exports.handlePlaceOrder = async (req, res) => {
  const { id } = req?.user?.payload;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ status: 0, msg: "User Id is not valid" });
  }

  const orderData = req.body;
  if (!orderData || !orderData.products) {
    return res
      .status(400)
      .json({ status: 0, msg: "Please provide Orders Data" });
  }

  // using session to process db changes simultenously
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    orderData.user = id; //linking User id in order doc

    const newOrder = await Order.create([orderData], { session }); // new order

    // 3. updating User document
    await User.findByIdAndUpdate(
      id,
      {
        $push: { orders: newOrder[0]._id },
        $set: { cart: [] },
      },
      { session, new: true },
    );

    // saving changes
    await session.commitTransaction();

    // success response
    res.status(200).json({
      status: 1,
      msg: "Order placed !!",
      order: newOrder[0],
    });
  } catch (error) {
    //rollback changes on failure
    await session.abortTransaction();
    res.status(500).json({
      status: 0,
      msg: "Transaction failed: " + error.message,
    });
  } finally {
    //  close the session
    session.endSession();
  }
};

exports.handleGetOrderHistory = async (req, res) => {
  const { id } = req?.user?.payload;

  let { limit, page } = req.query;
  limit = parseInt(limit) || 10;
  page = parseInt(page) || 1;
  const skip = (page - 1) * limit;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ status: 0, msg: "User Id is not valid" });
  }
  const userRecord = await User.findById(id, "orders");
  const totalOrdersCount = userRecord?.orders?.length || 0;

  // finding orders and applying pmethodrojection
  const orders = await User.findById(id, "orders").populate({
    path: "orders",
    select: "totalAmount shipping.trackingId orderStatus createdAt user",
    options: {
      skip: skip,
      limit: limit,
    },
  });

  if (!orders) {
    return res.status(404).json({
      status: 0,
      msg: "Orders history not found",
    });
  }

  const totalPages = Math.ceil(totalOrdersCount / limit);

  res.status(200).json({
    status: 1,
    msg: "Found Orders",
    orders,
    totalPages,
  });
};

exports.handleOrderCancellation = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      status: 0,
      msg: "Order id is not valid",
    });
  }

  const cancelOrder = await Order.findByIdAndUpdate(id, {
    $set: { orderStatus: "cancelled" },
  });

  if (!cancelOrder) {
    return res.status(404).json({
      status: 0,
      msg: "Orders history not found",
    });
  }

  res.status(200).json({
    status: 0,
    msg: "Order Cancelled",
  });
};

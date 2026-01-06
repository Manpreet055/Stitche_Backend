const mongoose = require("mongoose");
const Order = require("../models/order.model");
const User = require("../models/user.model");
const ApiError = require("../utils/ApiError");

exports.handleGetOrderDataById = async (req, res) => {
  const { id: userId, role } = req.user.payload;
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError("User Id is not valid", 400);
  }
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError("Order id is not valid", 400);
  }

  const userRecord = await User.findById(userId, "orders").lean();

  // authorization check
  if (
    !userRecord?.orders?.includes(mongoose.Types.ObjectId(id)) &&
    role !== "admin"
  ) {
    throw new ApiError("You are not authorized to access this order", 403);
  }

  const orders = await Order.findById(id)
    .populate("products.product")
    .populate("user", "profile.fullName")
    .lean();

  if (!orders) {
    throw new ApiError("Order not found", 404);
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
    throw new ApiError("Order id is not valid", 400);
  }

  // using sessions
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const findOrder = await Order.findById(id).lean().session(session);

    if (!findOrder) {
      await session.abortTransaction();
      session.endSession();
      throw new ApiError("Order not found", 404);
    }

    await User.findByIdAndUpdate(
      { _id: findOrder?.user },
      {
        $pull: { orders: id },
      },
      { session },
    ).lean();

    // deleting the order id from orders collection
    const deleteOrder = await Order.findByIdAndDelete(id, { session }).lean();
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
  const { id } = req.user.payload;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError("User Id is not valid", 400);
  }
  const orderData = req.body;
  if (!orderData || !orderData.products) {
    throw new ApiError("Please provide Orders Data", 400);
  }

  // using session
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    orderData.user = id; //linking User id in order doc
    const newOrder = await Order.create([orderData], { session }); // new order

    await User.findByIdAndUpdate(
      id,
      {
        $push: { orders: newOrder[0]._id },
        $set: { cart: [] },
      },
      { session, new: true },
    ).lean();

    await session.commitTransaction(); // saving changes
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
  const { id } = req.user.payload;

  let { limit, page } = req.query;
  limit = parseInt(limit) || 10;
  page = parseInt(page) || 1;
  const skip = (page - 1) * limit;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError("User Id is not valid", 400);
  }

  const userRecord = await User.findById(id, "orders").lean();
  const totalOrdersCount = userRecord?.orders?.length || 0;

  // finding orders and applying pmethodrojection
  const orders = await User.findById(id, "orders")
    .populate({
      path: "orders",
      select: "totalAmount shipping.trackingId orderStatus createdAt user",
      options: {
        skip: skip,
        limit: limit,
      },
    })
    .lean();

  if (!orders) {
    throw new ApiError("Orders history not found", 404);
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
  const { id: userId, role } = req.user.payload;
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError("User Id is not valid", 400);
  }

  // order id
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError("Order id is not valid", 400);
  }
  const userRecord = await User.findById(userId, "orders").lean();

  // authorization check
  if (
    !userRecord?.orders?.includes(mongoose.Types.ObjectId(id)) &&
    role !== "admin"
  ) {
    throw new ApiError("You are not authorized to access this order", 403);
  }

  //if authorized proceed to cancel order
  const cancelOrder = await Order.findByIdAndUpdate(id, {
    $set: { orderStatus: "cancelled" },
  }).lean();

  if (!cancelOrder) {
    throw new ApiError("Order history not found", 404);
  }

  res.status(200).json({
    status: 0,
    msg: "Order Cancelled",
  });
};

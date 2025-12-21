const mongoose = require("mongoose");
const Order = require("../models/order.model");

exports.handleGetOrderDataById = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      status: 0,
      msg: "Order id is not valid",
    });
  }

  const foundOrder = await Order.findById(id).lean();

  if (!foundOrder) {
    return res.status(404).json({
      status: 0,
      msg: "Order data not found",
    });
  }
  res.status(200).json({
    status: 1,
    msg: "Data fetching Successful",
    data: foundOrder,
  });
};

exports.handleDeleteOrderById = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      status: 0,
      msg: "Order id is not valid",
    });
  }

  const deleteOrder = await Order.findByIdAndDelete(id);

  if (!deleteOrder) {
    return res.status(404).json({
      status: 0,
      msg: "No order data found",
    });
  }

  res.status(200).json({
    status: 1,
    msg: "Data deleted successfully.",
    data: deleteOrder,
  });
};

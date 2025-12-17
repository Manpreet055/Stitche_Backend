const mongoose = require("mongoose");
const Order = require("../models/order.model");

const handleGetOrderDataById = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      status: 0,
      msg: "Order id is not valid",
    });
  }

  try {
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
  } catch (error) {
    res.status(500).json({
      status: 0,
      msg: error.message,
    });
  }
};

const handleDeleteOrderById = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      status: 0,
      msg: "Order id is not valid",
    });
  }

  try {
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
  } catch (error) {
    res.status(500).json({
      status: 0,
      msg: error.message,
    });
  }
};
module.exports = {
  handleGetOrderDataById,
  handleDeleteOrderById,
};

const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    method: {
      type: String,
      enum: ["card", "paypal", "cod"],
      required: true,
    },
    transactionId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "pending",
    },
  },
  { _id: false },
);

const shippingSchema = new mongoose.Schema(
  {
    address: String,
    city: String,
    postalCode: String,
    country: String,
    phone: String,
    trackingId: String,
  },
  { _id: false },
);

const orderSchema = new mongoose.Schema(
  {
    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
      max: 999,
    },
    discount: {
      type: Number,
      min: 0,
    },
    payment: {
      type: paymentSchema,
      required: true,
    },
    shipping: {
      type: shippingSchema,
      required: true,
    },
    orderStatus: {
      type: String,
      enum: ["pending", "shipped", "delivered"],
      default: "pending",
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;

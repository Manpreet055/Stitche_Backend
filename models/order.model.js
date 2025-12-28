const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    method: {
      type: String,
      enum: ["card", "paypal", "cod"],
      required: true,
    },
    transactionId: {
      type: Number,
      required: true,
    },
  },
  { _id: false },
);

const shippingSchema = new mongoose.Schema(
  {
    street: String,
    city: String,
    postalCode: String,
    country: String,
    phone: String,
    trackingId: String,
  },
  { _id: false },
);

const productsScheme = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    qty: {
      type: Number,
      required: true,
      default: 1,
    },
  },
  { _id: false },
);
const orderSchema = new mongoose.Schema(
  {
    products: [productsScheme],
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    discount: {
      type: Number,
      min: 0,
    },
    deliveryFee: {
      type: Number,
      min: 0,
    },
    priceAfterDiscount: {
      type: Number,
      min: 0,
    },
    subTotal: {
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
      enum: ["cancelled", "confirmed", "delivered", "pending", "shipped"],
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

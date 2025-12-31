const User = require("../models/user.model");
const mongoose = require("mongoose");

exports.handleGetCartData = async (req, res) => {
  // Validating the UserId first
  const { id } = req?.user?.payload;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      status: 0,
      msg: "User Id is not valid",
    });
  }

  const user = await User.findById(id).populate("cart.product");

  if (!user) {
    return res.status(404).json({
      status: 0,
      msg: "User not found",
    });
  }
  res.status(200).json({
    status: 1,
    msg: "Cart fetched ..",
    cart: user.cart,
  });
};

exports.handleAddProductToCart = async (req, res) => {
  try {
    const { id } = req.user?.payload;
    const { product, qty } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ status: 0, msg: "User Id is not valid" });
    }

    let user = await User.findOneAndUpdate(
      { _id: id, "cart.product": product },
      { $inc: { "cart.$.qty": qty || 1 } },
      { new: true, runValidators: true },
    ).populate("cart.product");

    //if user is null, it means the product wasn't in the cart
    if (!user) {
      user = await User.findByIdAndUpdate(
        id,
        { $push: { cart: { product, qty } } },
        { new: true, runValidators: true }, // Added new: true to get updated data
      ).populate("cart.product");
    }

    if (!user) {
      return res.status(404).json({ status: 0, msg: "User not found" });
    }

    return res.status(200).json({
      status: 1,
      msg: "Cart updated",
      cart: user.cart,
    });
  } catch (error) {
    return res.status(500).json({ status: 0, msg: error.message });
  }
};

exports.handleRemoveProductFromCart = async (req, res) => {
  // Validating the User Id
  const { id } = req.user.payload;
  const { productId } = req.query;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      status: 0,
      msg: "User Id is not valid",
    });
  }
  if (!id || !productId) {
    return res.status(400).json({
      status: 0,
      msg: "Please Provide Correct Product and User Id.",
    });
  }
  const user = await User.findOneAndUpdate(
    { _id: id, "cart.product": productId },
    { $pull: { cart: { product: productId } } },
    { new: true, runValidators: true },
  ).populate("cart.product");

  if (!user) {
    return res.status(404).json({
      status: 0,
      msg: "User does not exist.",
    });
  }

  res.status(200).json({
    status: 1,
    msg: "Product removed from cart.",
    cart: user?.cart,
  });
};

exports.handleUpdateCartQty = async (req, res) => {
  const { product, qty } = req.body;
  const { id } = req.user.payload;
  if (!mongoose.Types.ObjectId.isValid(id) || !product) {
    return res.status(400).json({
      status: 0,
      msg: "Please Provide Product and User ID",
    });
  }

  if (!qty || qty <= 0) {
    const updatedCart = await User.updateOne(
      { _id: id },
      {
        $pull: { cart: { product } },
      },
    ).populate("cart.product");
    return res.status(200).json({
      status: 1,
      msg: "Product removed from the cart",
      cart: updatedCart,
    });
  }

  const user = await User.findOneAndUpdate(
    { _id: id, "cart.product": product },
    { $set: { "cart.$.qty": qty } },
    { new: true, runValidators: true },
  ).populate("cart.product");

  res.status(200).json({
    status: 1,
    msg: "Quantity updated.",
    cart: user.cart,
  });
};

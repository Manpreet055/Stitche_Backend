const User = require("../models/user.model");
const mongoose = require("mongoose");
const ApiError = require("../utils/ApiError");

exports.handleGetCartData = async (req, res) => {
  // Validating the UserId first
  const { id } = req?.user?.payload;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError("User Id is not valid", 400);
  }
  const user = await User.findById(id).populate("cart.product").lean();
  if (!user) {
    throw new ApiError("User not found", 404);
  }
  res.status(200).json({
    status: 1,
    msg: "Cart fetched ..",
    cart: user.cart,
  });
};

exports.handleAddProductToCart = async (req, res) => {
  const { id } = req.user?.payload;
  const { product, qty } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError("User Id is not valid", 400);
  }

  let user = await User.findOneAndUpdate(
    { _id: id, "cart.product": product },
    { $inc: { "cart.$.qty": qty || 1 } },
    { new: true, runValidators: true },
  )
    .populate("cart.product")
    .lean();

  //if user is null, it means the product wasn't in the cart
  if (!user) {
    user = await User.findByIdAndUpdate(
      id,
      { $push: { cart: { product, qty } } },
      { new: true, runValidators: true }, // Added new: true to get updated data
    )
      .populate("cart.product")
      .lean();
  }

  if (!user) {
    throw new ApiError("User not found", 404);
  }
  return res.status(200).json({
    status: 1,
    msg: "Cart updated",
    cart: user.cart,
  });
};

exports.handleRemoveProductFromCart = async (req, res) => {
  // Validating the User Id
  const { id } = req.user.payload;
  const { productId } = req.query;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError("User Id is not valid", 400);
  }

  if (!id || !productId) {
    throw new ApiError("Please Provide Correct Product and User Id.", 400);
  }

  const user = await User.findOneAndUpdate(
    { _id: id, "cart.product": productId },
    { $pull: { cart: { product: productId } } },
    { new: true, runValidators: true },
  )
    .populate("cart.product")
    .lean();

  if (!user) {
    throw new ApiError("User does not exist!", 404);
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
    throw new ApiError("User Id is not valid", 400);
  }

  if (!qty || qty <= 0) {
    const updatedCart = await User.updateOne(
      { _id: id },
      {
        $pull: { cart: { product } },
      },
    )
      .populate("cart.product")
      .lean();

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
  )
    .populate("cart.product")
    .lean();

  res.status(200).json({
    status: 1,
    msg: "Quantity updated.",
    cart: user.cart,
  });
};

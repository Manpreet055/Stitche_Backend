const User = require("../models/user.model");
const mongoose = require("mongoose");

const handleGetCartData = async (req, res) => {
  // Validating the UserId first
  const { id } = req?.user?.payload;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      status: 0,
      msg: "User Id is not valid",
    });
  }

  try {
    const user = await User.findById(id).populate("cart.product");

    if (!user) {
      return res.status(400).json({
        status: 0,
        msg: "User not found",
      });
    }
    res.status(200).json({
      status: 1,
      msg: "Cart fetched ..",
      cart: user.cart,
    });
  } catch (error) {
    res.status(500).json({
      status: 0,
      msg: error.message,
    });
  }
};

const handleAddProductToCart = async (req, res) => {
  // Validating the User Id
  const { id } = req.user.payload;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      status: 0,
      msg: "User Id is not valid",
    });
  }

  try {
    const { product, qty } = req.body;

    const updated = await User.updateOne(
      { _id: id, "cart.product": product },
      { $inc: { "cart.$.qty": 1 } },
    );

    if (updated.matchedCount === 0) {
      await User.updateOne({ _id: id }, { $push: { cart: { product, qty } } });
    }
    return res.status(200).json({
      status: 0,
      msg: "Cart updated",
    });
  } catch (error) {
    res.status(500).json({
      status: 0,
      msg: error.message,
    });
  }
};

const handleRemoveProductFromCart = async (req, res) => {
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
  try {
    const user = await User.updateOne(
      { _id: id, "cart.product": productId },
      { $pull: { cart: { product: productId } } },
    );

    if (!user) {
      return res.status(404).json({
        status: 0,
        msg: "User does not exist.",
      });
    }

    res.status(200).json({
      status: 0,
      msg: "Product removed from cart.",
      user,
    });
  } catch (error) {
    res.status(500).json({
      status: 0,
      msg: error.message,
    });
  }
};

const handleUpdateCartQty = async (req, res) => {
  const { product, qty } = req.body;
  const { id } = req.user.payload;
  if (!mongoose.Types.ObjectId.isValid(id) || !product) {
    return res.status(400).json({
      status: 0,
      msg: "Please Provide Product and User ID",
    });
  }

  try {
    if (!qty || qty <= 0) {
      await User.updateOne(
        { _id: id },
        {
          $pull: { cart: { product } },
        },
      );
      return res.status(200).json({
        status: 1,
        msg: "Product removed from the cart",
      });
    }

    await User.updateOne(
      { _id: id, "cart.product": product },
      { $set: { "cart.$.qty": qty } },
    );

    res.status(200).json({
      status: 1,
      msg: "Quantity updated.",
    });
  } catch (error) {
    res.status(500).json({
      status: 0,
      msg: error.message,
    });
  }
};

module.exports = {
  handleGetCartData,
  handleUpdateCartQty,
  handleAddProductToCart,
  handleRemoveProductFromCart,
};

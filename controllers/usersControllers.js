const User = require("../models/userSchema");
const bcrypt = require("bcrypt");
// const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");

const handleLogin = async (req, res) => {
  try {
    const { email, password } = req.query;
    const user = await User.findOne({ email }).populate("cart");
    if (!user) {
      return res.status(401).json({
        status: 0,
        msg: "Invalid email or password",
      });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        status: 0,
        msg: "Incorrect Password",
      });
    }

    res.status(200).json({
      status: 1,
      msg: "Login Sucessfully",
      user,
    });
  } catch (error) {
    res.status(500).json({
      status: 0,
      msg: error.message,
    });
  }
};

const handleCart = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        status: 0,
        msg: "User Id is not valid",
      });
    }
    const cart = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({
        status: 0,
        msg: "User not found..",
      });
    }
    const flattendCart = cart.map((product) => ({
      product: product.productId,
      qty: typeof product.qty === "number" && product.qty > 0 ? product.qty : 1,
    }));

    flattendCart.forEach(({ product, qty }) => {
      const idx = user.cart.findIndex(
        (c) => String(c.product) === String(product),
      );
      if (idx > -1) {
        user.cart[idx].qty = (user.cart[idx].qty || 0) + qty;
      } else {
        user.cart.push({ product, qty });
      }
    });

    await user.save();

    return res.status(200).json({
      status: 0,
      msg: "Cart updated",
      cart: user.cart,
    });
  } catch (error) {
    res.status(500).json({
      status: 0,
      msg: error.message,
    });
  }
};

const handleGetUserById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        status: 0,
        msg: "Id is not valid",
      });
    }

    const user = await User.findById(id).populate("cart.product");

    if (!user) {
      res.status(404).json({
        status: 0,
        msg: "User not found",
      });
    }
    res.status(200).json({
      status: 1,
      msg: "User Found.",
      user,
    });
  } catch (error) {
    const statusCode = error?.statusCode || 500;

    res.status(statusCode).json({
      status: 0,
      msg: `Something went wrong:${error.message}`,
    });
  }
};
module.exports = { handleLogin, handleCart, handleGetUserById };

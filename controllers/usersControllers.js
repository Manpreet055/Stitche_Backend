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

const handleSignup = async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).json({
        status: 0,
        msg: "Please Provide Signup Data",
      });
    }
    const randomPhoneNumber = Math.floor(
      1000000000 + Math.random() * 9000000000,
    );

    const formData = {
      ...req.body,
      username: (req.body?.fullname + "123").trim(),
      cart: [],
      profile: {
        fullName: req.body?.fullname,
        phone: randomPhoneNumber,
      },
    };
    delete formData?.fullname;

    const user = await User.create(formData);

    res.status(200).json({
      status: 0,
      msg: "Please Provide Signup Data",
      user,
    });
  } catch (error) {
    res.status(500).json({
      status: 0,
      msg: "Server Error : " + error.message,
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
    res.status(500).json({
      status: 0,
      msg: `Something went wrong:${error.message}`,
    });
  }
};

const handleAddProductToCart = async (req, res) => {
  try {
    const { userId } = req.query;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        status: 0,
        msg: "User Id is not valid",
      });
    }

    const { product, qty } = req.body;
    const updated = await User.updateOne(
      { _id: userId, "cart.product": product },
      { $inc: { "cart.$.qty": 1 } },
    );

    if (updated.matchedCount === 0) {
      await User.updateOne(
        { _id: userId },
        { $push: { cart: { product, qty } } },
      );
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
  try {
    const { userId, productId } = req.query;

    if (!userId || !productId) {
      return res.status(400).json({
        status: 0,
        msg: "Please Provide Correct Product and User Id.",
      });
    }

    const user = await User.updateOne(
      { _id: userId, "cart.product": productId },
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

const handleCartQty = async (req, res) => {
  try {
    const { userId, product, qty } = req.query;

    if (!mongoose.Types.ObjectId.isValid(userId) || !product) {
      return res.status(400).json({
        status: 0,
        msg: "Please Provide Product and User ID",
      });
    }

    if (!qty || qty <= 0) {
      await User.updateOne(
        { _id: userId },
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
      { _id: userId, "cart.product": product },
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
  handleCartQty,
  handleLogin,
  handleSignup,
  handleAddProductToCart,
  handleGetUserById,
  handleRemoveProductFromCart,
};

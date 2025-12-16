const User = require("../models/userSchema");
const bcrypt = require("bcrypt");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../middlewares/jwtAuthMiddleware");
const mongoose = require("mongoose");

const handleLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        status: 0,
        msg: "Invalid email or password",
      });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        status: 0,
        msg: "Incorrect Password",
      });
    }
    const payload = {
      id: user.id,
      role: user.role,
    };

    const token = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    user.refreshToken = [...user.refreshToken, refreshToken];
    await user.save();

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 24 * 60 * 60 * 1000,
    });
    res.status(200).json({
      status: 1,
      msg: "Login Successfull",
      token,
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

    const payload = {
      id: user.id,
    };
    const token = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    user.refreshToken = [...user.refreshToken, refreshToken];
    await user.save();

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      status: 1,
      msg: "User Created",
      token,
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
    const { id } = req.user.payload;

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
    const { id } = req.user.payload;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: 0,
        msg: "User Id is not valid",
      });
    }

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
  try {
    const { productId } = req.query;
    const { id } = req.user.payload;

    if (!id || !productId) {
      return res.status(400).json({
        status: 0,
        msg: "Please Provide Correct Product and User Id.",
      });
    }

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

const handleCartQty = async (req, res) => {
  try {
    const { product, qty } = req.body;
    const { id } = req.user.payload;
    if (!mongoose.Types.ObjectId.isValid(id) || !product) {
      return res.status(400).json({
        status: 0,
        msg: "Please Provide Product and User ID",
      });
    }

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
  handleCartQty,
  handleLogin,
  handleSignup,
  handleAddProductToCart,
  handleGetUserById,
  handleRemoveProductFromCart,
};

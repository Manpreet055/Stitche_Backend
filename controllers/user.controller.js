const User = require("../models/user.model");
const bcrypt = require("bcrypt");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../middlewares/auth.middleware");
const mongoose = require("mongoose");

const handleGetUserById = async (req, res) => {
  const { id } = req.user.payload;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      status: 0,
      msg: "Id is not valid",
    });
  }

  try {
    const user = await User.findById(id).populate("cart.product");

    if (!user) {
      return res.status(404).json({
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

const handleSignup = async (req, res) => {
  if (!req.body) {
    return res.status(400).json({
      status: 0,
      msg: "Please Provide Signup Data",
    });
  }

  try {
    // generating random Number
    const randomPhoneNumber = Math.floor(
      1000000000 + Math.random() * 9000000000,
    );

    // generating form data to pass schema validation
    const formData = {
      ...req.body,
      username: (req.body?.fullname + "123").trim(),
      cart: [],
      profile: {
        fullName: req.body?.fullname,
        phone: randomPhoneNumber,
      },
    };

    // deleting the full name key from formdata
    delete formData?.fullname;

    const user = await User.create(formData);

    // creating payload to generate tokens
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
      sameSite: "none",
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

    // if user has more than 2 token we are deleting old token from the database
    // and assigning new token to him
    if (user.refreshToken.length > 2) {
      user.refreshToken = [refreshToken];
    } else {
      user.refreshToken.push(refreshToken);
    }
    await user.save();

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
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

const handleLogoutUser = async (req, res) => {
  const { id } = req.user.payload;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      status: 0,
      msg: "Id is not valid",
    });
  }
  const refreshToken = req.cookies?.refreshToken;
  if (!refreshToken) {
    return res.sendStatus(204);
  }

  try {
    await User.findOneAndUpdate(
      { _id: id },
      { $pull: { refreshToken: refreshToken } },
    );
  } catch (error) {
    res.status(500).json({
      status: 0,
      msg: error.message,
    });
  }

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "none",
  });
  console.log("logout");
  return res.sendStatus(204);
};

module.exports = {
  handleLogin,
  handleSignup,
  handleLogoutUser,
  handleGetUserById,
};

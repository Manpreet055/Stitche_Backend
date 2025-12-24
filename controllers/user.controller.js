const User = require("../models/user.model");
const bcrypt = require("bcrypt");
const uploadBuffer = require("../utils/uploadBuffer");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../middlewares/auth.middleware");
const mongoose = require("mongoose");

exports.handleGetUserById = async (req, res) => {
  if (!req.user || !req.user.payload?.id) {
    return res.status(401).json({
      status: 0,
      msg: "Unauthorized",
    });
  }

  // Valiidating the Id
  const { id } = req.user.payload;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      status: 0,
      msg: "Id is not valid",
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
    msg: "User found",
    user,
  });
};

exports.handleSignup = async (req, res) => {
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
    if (!user) {
      return res.status(409).json({
        status: 0,
        msg: "failed to create the user",
      });
    }
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
      secure: true,
      sameSite: "none",
      maxAge: 15 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      status: 1,
      msg: "User Created",
      token,
    });
  } catch (error) {
    if (error?.errorResponse?.code === 11000) {
      return res.status(409).json({
        status: 0,
        msg: "Email or username already exist",
      });
    }
    res.status(500).json({
      status: 0,
      msg: error.message,
    });
  }
};

exports.handleLogin = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({
      status: 0,
      msg: "User not found",
    });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({
      status: 0,
      msg: "Incorrect login credentials",
    });
  }
  const payload = {
    id: user.id,
    role: user.role,
  };

  const token = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  // Only allowed limited token
  // if limit hits than the oldest token will be removed
  const MAX_TOKENS = Number(process.env.MAX_REFRESH_TOKENS) || 5;

  if (user.refreshToken.length === MAX_TOKENS) {
    user.refreshToken.shift();
    user.refreshToken.push(refreshToken);
  } else {
    user.refreshToken.push(refreshToken);
  }
  await user.save();

  // Setting the cookies
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 15 * 24 * 60 * 60 * 1000,
  });

  //Sending the access token in response body
  res.status(200).json({
    status: 1,
    msg: "Login Successfull",
    token,
  });
};

exports.handleLogoutUser = async (req, res) => {
  const { id } = req?.user?.payload;
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

  await User.findOneAndUpdate(
    { _id: id },
    { $pull: { refreshToken: refreshToken } },
  );

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });
  return res.sendStatus(204);
};

exports.handleSubscribeNewLetter = async (req, res) => {
  const { email } = req.query;
  if (!email || email === "") {
    return res.status(400).json({
      status: 0,
      msg: "Please provide email",
    });
  }

  const user = await User.updateOne({ email });
  console.log(user);

  if (!user) {
    return res.status(404).json({
      status: 0,
      msg: "User not found",
    });
  }

  res.status(200).json({
    status: 0,
    msg: "Subscribed",
    user,
  });
};

exports.updateUserProfile = async (req, res) => {
  const { id } = req?.user?.payload;
  // Checking for invalid id
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      status: 0,
      msg: "User Id is not valid",
    });
  }

  const user = await User.findById(id);
  if (!user) {
    return res.status(404).json({
      status: 0,
      msg: "User not found",
    });
  }

  const avatar = req.file;
  if (avatar) {
    const uploadedPic = await uploadBuffer(
      // converting buffer into streams
      avatar.buffer, // incoming file buffer provided by multer
      `/users/profile-pics`, // Cloudinary folder name
    );
    user.profile.avatar = uploadedPic.secure_url;
  }

  // only allowed these fields to change
  const allowedFields = [
    "username",
    "email",
    "fullName",
    "phone",
    "street",
    "city",
    "country",
    "postalCode",
  ];

  allowedFields.forEach((field) => {
    if (field in req.body) {
      if (["street", "city", "country", "postalCode"].includes(field)) {
        user.profile.address[field] = req.body[field];
      } else if (["username", "email"].includes(field)) {
        user[field] = req.body[field];
      } else if (["fullName", "phone"].includes(field)) {
        user.profile[field] = req.body[field];
      }
    }
  });

  await user.save();

  res.status(200).json({
    status: 1,
    msg: "Profile updated",
  });
};

const User = require("../models/user.model");
const bcrypt = require("bcrypt");
const uploadBuffer = require("../utils/uploadBuffer");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../middlewares/auth.middleware");
const mongoose = require("mongoose");
const ApiError = require("../utils/ApiError");

exports.handleGetUserById = async (req, res) => {
  if (!req.user || !req.user.payload?.id) {
    throw new ApiError("Unauthorized", 401);
  }

  // Valiidating the Id
  const { id } = req.user.payload;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError("Id is not valid", 400);
  }

  const user = await User.findById(id, -"password -refreshToken")
    .populate("cart.product")
    .lean();

  if (!user) {
    throw new ApiError("User not found", 404);
  }

  res.status(200).json({
    status: 1,
    msg: "User found",
    user,
  });
};

exports.handleSignup = async (req, res) => {
  if (!req.body) {
    throw new ApiError("Please Provide Signup Data", 400);
  }

  // generating form data to pass schema validation
  const formData = {
    ...req.body,
    username: (req.body?.fullname + "123").trim(),
    cart: [],
    profile: {
      fullName: req.body?.fullname,
      phone: Math.floor(1000000000 + Math.random() * 9000000000), // random number
    },
  };

  delete formData?.fullname; // deleting the full name key from formdata
  const user = await User.create(formData);
  if (!user) {
    throw new ApiError("failed to create the user", 409);
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
    user,
  });
};

exports.handleLogin = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).populate("cart.product");
  if (!user) {
    throw new ApiError("User not found", 404);
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new ApiError("Incorrect login credentials", 401);
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
    user,
  });
};

exports.handleLogoutUser = async (req, res) => {
  const { id } = req.user.payload;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError("Id is not valid", 400);
  }

  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    return res.sendStatus(204);
  }

  await User.findByIdAndUpdate(id, {
    $pull: { refreshToken: refreshToken },
  }).lean();
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });
  return res.sendStatus(204);
};

exports.handleSubscribeNewLetter = async (req, res) => {
  const { id } = req.user.payload;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError("Id is not valid", 400);
  }
  const { email } = req.query;
  if (!email || email === "") {
    throw new ApiError("Please provide email", 400);
  }

  const result = await User.findOneAndUpdate(
    { _id: id, email: email },
    [{ $set: { isSubscribed: { $not: "$isSubscribed" } } }],
    {
      new: true, // Returns the document AFTER the toggle
      projection: { isSubscribed: 1 }, // Only returns the isSubscribed field
      lean: true, // Returns a plain JS object
    },
  );
  if (!result) {
    throw new ApiError("User not found or email mismatch", 404);
  }

  res.status(200).json({
    status: 0,
    msg: "Subscribed",
    state: result.isSubscribed,
  });
};

exports.updateUserProfile = async (req, res) => {
  const { id } = req.user.payload;
  // Checking for invalid id
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError("User id is not valid", 400);
  }

  const user = await User.findById(id);
  if (!user) {
    throw new ApiError("User not found", 404);
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

  if (!user.profile.address) {
    user.profile.address = {
      street: "",
      city: "",
      country: "",
      postalCode: "",
    };
  }

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
    user,
  });
};

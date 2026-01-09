const User = require("../models/user.model");
const bcrypt = require("bcrypt");
const { uploadWithPreset } = require("../utils/uploadBuffer");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../middlewares/authentication.middleware");
const cloudinary = require("../config/cloudinary");
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

  // Fetching user without sensitive info
  const user = await User.findById(id, "-password -refreshToken")
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

  // Creating form data for new user
  const formData = {
    ...req.body,
    username: (req.body?.fullname + "123").trim(),
    cart: [],
    role: "user", // default role so that no one can signup as admin
    profile: {
      fullName: req.body?.fullname,
    },
  };
  delete formData?.fullname;

  const user = await User.create(formData);
  if (!user) {
    throw new ApiError("failed to create the user", 409);
  }

  /// Generating tokens
  const payload = {
    id: user.id,
    role: user.role,
  };
  const token = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);
  user.refreshToken = [...user.refreshToken, refreshToken];

  await user.save(); // saving the refresh token
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production" ? true : false,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 15 * 24 * 60 * 60 * 1000,
  });

  // Removing sensitive info before sending response
  user.password = undefined;
  user.refreshToken = undefined;
  res.status(201).json({
    status: 1,
    msg: "User Created",
    token,
    user,
  });
};

exports.handleLogin = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new ApiError("Please provide email and password", 400);
  }

  const user = await User.findOne({ email }).populate("cart.product");
  if (!user) {
    throw new ApiError("User not found", 404);
  }

  // bcrypt password comparison
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new ApiError("Incorrect login credentials", 401);
  }

  // Generating tokens
  const payload = {
    id: user.id,
    role: user.role,
  };
  const token = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  // max refresh tokens logic
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
    secure: process.env.NODE_ENV === "production" ? true : false,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 15 * 24 * 60 * 60 * 1000,
  });

  // Removing sensitive info before sending response
  user.password = undefined;
  user.refreshToken = undefined;
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
    secure: process.env.NODE_ENV === "production" ? true : false,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
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

  // Toggling the isSubscribed field
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
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError("User id is not valid", 400);
  }

  const user = await User.findById(id);
  if (!user) {
    throw new ApiError("User not found", 404);
  }

  const avatar = req.file;
  if (avatar) {
    if (user.profile?.avatarId) {
      // Delete the previous avatar from Cloudinary
      await cloudinary.uploader.destroy(user.profile.avatarId);
    }

    let buffer = avatar.buffer;
    // converting buffer into streams
    const uploadedPic = await uploadWithPreset(
      buffer, // incoming file buffer provided by multer
      `/users/profile-pics`, // Cloudinary folder name
      "profile", // Preset name for profile pictures
    );
    buffer = null;
    user.profile.avatar = uploadedPic.secure_url;
    user.profile.avatarId = uploadedPic.public_id;
  }

  //whitelisting fields that can be updated
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

  // Ensuring address object exists
  if (!user.profile.address) {
    user.profile.address = {
      street: "",
      city: "",
      country: "",
      postalCode: "",
    };
  }
  // Updating only allowed fields
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

  // Removing sensitive info before sending response
  user.password = undefined;
  user.refreshToken = undefined;
  res.status(200).json({
    status: 1,
    msg: "Profile updated",
    user,
  });
};

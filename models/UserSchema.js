const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema(
  {
    street: {
      type: String,
      default: "Not specified",
    },
    city: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
    postalCode: {
      type: String,
      default: "0000",
    },
  },
  { _id: false }
);
const profileSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    phone: {
      type: Number,
      required: true,
      unique: true,
    },
    avatar: {
      type: String,
      required: true,
    },
    address: {
      type: addressSchema,
      required: true,
    },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      default: "Unknown",
    },
    profile: {
      type: profileSchema,
      required: true,
    },
    refreshToken: {
      type: String,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

module.exports = User;

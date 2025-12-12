const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

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
  { _id: false },
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
  { _id: false },
);

const cartItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
    qty: {
      type: Number,
    },
  },
  { _id: false },
);

const userPreferences = new mongoose.Schema({
  theme: {
    type: String,
    enum: ["dark", "light"],
    default: "light",
    lowercase: true,
  },
});
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
    cart: [cartItemSchema],
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
  { timestamps: true },
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;

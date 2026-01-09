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
      default: "Not specified",
    },
    country: {
      type: String,
      default: "Not specified",
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
      unique: true,
      sparse: true,
    },
    avatar: {
      type: String,
    },
    avatarId: {
      type: String,
    },
    address: {
      type: addressSchema,
    },
  },
  { _id: false },
);

const cartItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    qty: {
      type: Number,
      min: 1,
      default: 1,
    },
  },
  { _id: false },
);

const userPreferences = new mongoose.Schema(
  {
    theme: {
      type: String,
      enum: ["dark", "light"],
      default: "light",
      lowercase: true,
    },
  },
  { _id: false },
);
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
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
      default: "user",
      lowercase: true,
      enum: ["user", "admin", "Unknown"],
    },
    preferences: userPreferences,

    profile: {
      type: profileSchema,
    },

    refreshToken: {
      type: [String],
      default: [],
    },

    isVerified: {
      type: Boolean,
      default: false,
    },
    isSubscribed: {
      type: Boolean,
      default: false,
    },
    messages: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message",
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    orders: [{ type: mongoose.Schema.Types.ObjectId, ref: "Order" }],
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

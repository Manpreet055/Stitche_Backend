const mongoose = require("mongoose");

const discountSchema = new mongoose.Schema(
  {
    value: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
  },
  { _id: false },
);

const ratingSchema = new mongoose.Schema(
  {
    average: {
      type: Number,
      default: 0,
    },
    count: {
      type: Number,
      default: 0,
    },
  },
  { _id: false },
);

const mediaSchema = new mongoose.Schema(
  {
    thumbnail: {
      type: String,
      default: "",
    },
    images: {
      type: [String],
      default: [],
    },
  },
  { _id: false },
);

const ProductSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },

    subCategory: {
      type: String,
      default: function () {
        return this.category;
      },
    },

    barcode: { type: Number, required: true },
    brand: { type: String, required: true },
    sku: { type: String, required: true },
    price: { type: Number, required: true },

    discount: { type: discountSchema, required: true },
    stock: { type: Number, required: true },

    rating: ratingSchema,
    media: mediaSchema,

    isFeatured: { type: Boolean, default: false },

    timestamps: {
      createdAt: Date,
      updatedAt: Date,
    },
  },
  {
    timestamps: {
      createdAt: "timestamps.createdAt",
      updatedAt: "timestamps.updatedAt",
    },
  },
);

const Product = mongoose.model("Product", ProductSchema);

module.exports = Product;

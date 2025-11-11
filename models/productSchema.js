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
    priceAfterDiscount: {
      type: Number,
      required: true,
    },
  },
  { _id: false },
);

const ratingSchema = new mongoose.Schema(
  {
    average: {
      type: Number,
    },
    count: {
      type: Number,
    },
  },
  { _id: false },
);

const mediaSchema = new mongoose.Schema(
  {
    thumbnail: {
      type: String,
    },
    images: {
      type: [String],
    },
  },
  { _id: false },
);

const ProductSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    subCategory: {
      type: String,
      default: function () {
        return this.category;
      },
    },
    barcode: {
      type: String,
      require: true,
    },
    brand: {
      type: String,
      required: true,
    },
    sku: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    discount: {
      type: discountSchema,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    stock: {
      type: Number,
      required: true,
    },
    rating: {
      type: ratingSchema,
    },
    media: {
      type: mediaSchema,
      required: true,
    },
    isFeatured: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  { timestamps: true },
);

const Product = mongoose.model("product", ProductSchema);

module.exports = Product;

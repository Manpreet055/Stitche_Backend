const Product = require("../models/product.model");
const parseNumbers = require("../utils/parseNumber");
const applyFilters = require("../utils/applyFilters");
const ApiError = require("../utils/ApiError");
const mongoose = require("mongoose");
const {
  handleNewProductImages,
  handleUpdatedProductImages,
} = require("../utils/handleImages");

exports.handleGetProducts = async (req, res) => {
  let { limit, page, sortingOrder, sortField, price, ...filters } = req.query;

  filters = applyFilters(filters); // parsing filters from query params

  limit = parseInt(limit) || 10;
  page = parseInt(page) || 1;
  const skip = (page - 1) * limit;
  const length = await Product.countDocuments({
    ...filters,
    isFeatured: true,
    price: { $lt: price ?? 1500 },
  });
  const totalPages = Math.ceil(length / limit); // calculating total pages

  const order = sortingOrder === "desc" ? -1 : 1;

  // fetching products based on filters, pagination and sorting
  const allProducts = await Product.find({
    ...filters,
    isFeatured: true,
    price: { $lt: price ?? 1500 },
  })
    .sort(sortField ? { [sortField]: order } : { _id: 1 })
    .skip(skip)
    .limit(limit)
    .lean();

  res.status(200).json({
    status: 1,
    msg: "Products fetched successfully ",
    totalPages: totalPages,
    products: allProducts,
  });
};

exports.handleToggleFeatured = async (req, res) => {
  const { isFeatured, _id } = req.body;
  if (!_id || typeof isFeatured === "undefined") {
    throw new ApiError("Product ID and isFeatured status are required", 400);
  }

  // Check if product exists
  const product = await Product.findById(_id);
  if (!product) {
    throw new ApiError("Product not found", 404);
  }

  // Update featured status
  const updateFeaturedStatus = await Product.findByIdAndUpdate(
    _id,
    { isFeatured },
    { new: true },
  ).lean();

  // Respond with updated product
  res.status(200).json({
    status: 1,
    msg: "Product featured status updated successfully",
    updateFeaturedStatus,
  });
};

exports.handleUpdateProduct = async (req, res) => {
  const updates = req.body;
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError("Product ID is not valid", 400);
  }

  const product = await Product.findById(id);
  if (!product) {
    throw new ApiError("Product not found", 404);
  }

  // handle images update
  const { images, thumbnail } = await handleNewProductImages(
    req,
    product,
    updates,
  );
  product.media.thumbnail = thumbnail;
  product.media.images = images;

  delete updates.removedImages;

  // handle discount update
  if (!product.discount) product.discount = {};
  if (updates.value !== undefined) {
    product.discount.value = Number(updates.value);
  }
  if (updates.type !== undefined) {
    product.discount.type = updates.type;
  }
  delete updates.value;
  delete updates.type;

  // parse numeric fields and apply other updates to product
  const parsedFields = parseNumbers(updates);
  delete parsedFields.media;
  delete parsedFields.discount;

  Object.assign(product, parsedFields);
  await product.save();

  // Respond with updated product
  res.status(200).json({
    status: 1,
    msg: "Product updated successfully",
    updatedProduct: product,
  });
};

exports.handleGetProductDataById = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError("Product ID is not valid", 400);
  }

  const product = await Product.findById(id).lean();

  if (!product) {
    throw new ApiError("Product data not found", 404);
  }
  res.status(200).json({
    status: 1,
    msg: "Data fetching Successful",
    data: product,
  });
};

exports.handleCreateProduct = async (req, res) => {
  // Convert numeric formData values
  let productDetails = parseNumbers(req.body);

  //handle discount details
  const discount = {
    value: Number(productDetails.value) || 0,
    type: productDetails.type || "no-offers",
  };
  delete productDetails.value;
  delete productDetails.type;

  //handle images upload
  const { images, thumbnail } = await handleUpdatedProductImages(req);
  const media = { thumbnail, images };

  const rating = {
    average: 0,
    count: 0,
  };
  // Final product object
  const finalProduct = {
    ...productDetails,
    media,
    rating,
    discount,
  };

  const created = await Product.create(finalProduct);
  // Respond with created product
  res.status(201).json({
    status: 1,
    msg: "Product Created Successfully",
    createdProduct: created,
  });
};

exports.handleProductSearch = async (req, res) => {
  const { query, limit } = req.query;
  if (!query) {
    throw new ApiError("Search query is required", 400);
  }

  const results = await Product.aggregate([
    {
      $search: {
        index: "products_search_index",
        text: {
          query: query,
          path: ["name", "title", "category", "brand", "subCategory"],
          fuzzy: { maxEdits: 2 },
        },
      },
    },
    { $limit: Number(limit) || 10 },
  ]);

  res.status(200).json({
    status: 1,
    msg: "Found these results..",
    products: results,
  });
};

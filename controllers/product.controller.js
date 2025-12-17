const Product = require("../models/product.model");
const uploadBuffer = require("../utils/uploadBuffer");
const parseNumbers = require("../utils/parseNumber");
const applyFilters = require("../utils/applyFilters");

const handleGetProducts = async (req, res) => {
  try {
    let { limit, page, sortingOrder, sortField, ...filters } = req.query;

    filters = applyFilters(filters); // Parsing the filters into what mongoose want

    limit = parseInt(limit) || 10;
    page = parseInt(page) || 1;
    const skip = (page - 1) * limit;
    const length = await Product.countDocuments({
      ...filters,
      isFeatured: true,
    });
    const totalPages = Math.ceil(length / limit); //Calculating totalPages and sending it to the frontend for ease

    const order = sortingOrder === "desc" ? -1 : 1;

    const allProducts = await Product.find({ ...filters, isFeatured: true })
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
  } catch (error) {
    const statusCode = error?.statusCode || 500;
    res.status(statusCode).json({
      status: 0,
      msg: `Server Error : ${error.message}`,
    });
  }
};

const handleToggleFeatured = async (req, res) => {
  const { isFeatured, _id } = req.body;
  if (!_id || typeof isFeatured === "undefined") {
    return res.status(400).json({
      status: 0,
      msg: "Please provide all details to updated the featured status ",
    });
  }
  try {
    const updateFeaturedStatus = await Product.findByIdAndUpdate(
      _id,
      { isFeatured },
      { new: true },
    );
    res.status(200).json({
      status: 1,
      msg: "Product Featured status updated sucessfully..",
      updateFeaturedStatus,
    });
  } catch (err) {
    res.status(500).send({
      status: 0,
      msg: `Server Error : ${err.message}`,
    });
  }
};

const handleUpdateProduct = async (req, res) => {
  const updates = req.body;
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ status: 0, msg: "Product ID required" });
  }

  try {
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ status: 0, msg: "Product not found" });
    }

    // PREPARE OLD VALUES
    let images = [...product.media.images];
    let thumbnail = product.media.thumbnail;

    // HANDLE NEW THUMBNAIL
    if (req.files?.newThumbnail) {
      const result = await uploadBuffer(
        req.files.newThumbnail[0].buffer,
        `products/${product.title.trim()}/thumbnails`,
      );
      thumbnail = result.secure_url;
    }

    // HANDLE NEW IMAGES
    if (req.files?.newImages) {
      for (const img of req.files.newImages) {
        const result = await uploadBuffer(
          img.buffer,
          `products/${product.title.trim()}/images`,
        );
        images.push(result.secure_url);
      }
    }

    // HANDLE REMOVED IMAGES
    let removedImages = updates.removedImages || [];

    if (typeof removedImages === "string") {
      // If single value OR comma-separated string
      removedImages = removedImages.split(",");
    }

    if (!Array.isArray(removedImages)) {
      removedImages = [removedImages];
    }

    if (removedImages.length > 0) {
      images = images.filter((url) => !removedImages.includes(url));
    }
    delete updates.removedImages;

    // UPDATE MEDIA
    product.media.thumbnail = thumbnail;
    product.media.images = images;

    // UPDATE DISCOUNT
    if (!product.discount) product.discount = {};

    if (updates.value !== undefined) {
      product.discount.value = Number(updates.value);
    }
    if (updates.type !== undefined) {
      product.discount.type = updates.type;
    }
    delete updates.value;
    delete updates.type;

    // UPDATE NORMAL FIELDS
    const parsedFields = parseNumbers(updates);
    delete parsedFields.media;
    delete parsedFields.discount;

    Object.assign(product, parsedFields);

    await product.save();

    res.status(200).json({
      status: 1,
      msg: "Product updated successfully",
      updatedProduct: product,
    });
  } catch (error) {
    res.status(500).json({ status: 0, msg: error.message });
  }
};

const handleCreateProduct = async (req, res) => {
  try {
    const imagesUrls = [];
    let thumbnailUrl = "";

    // Upload thumbnail
    if (req.files?.thumbnail) {
      const result = await uploadBuffer(
        req.files.thumbnail[0].buffer,
        `products/${req.body.title.trim()}/thumbnails`,
      );
      thumbnailUrl = result.secure_url;
    }

    // Upload images
    if (req.files?.images) {
      for (const img of req.files.images) {
        const result = await uploadBuffer(
          img.buffer,
          `products/${req.body.title.trim()}/images`,
        );
        imagesUrls.push(result.secure_url);
      }
    }

    // Convert numeric formData values
    let productDetails = parseNumbers(req.body);

    // Extract discount correctly
    const discount = {
      value: Number(productDetails.value) ?? 0,
      type: productDetails.type || "no-offers",
    };

    // Remove discount fields from req.body
    delete productDetails.value;
    delete productDetails.type;

    const media = {
      thumbnail: thumbnailUrl,
      images: imagesUrls,
    };

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

    res.status(201).json({
      status: 1,
      msg: "Product Created Successfully",
      createdProduct: created,
    });
  } catch (error) {
    res.status(500).json({ status: 0, msg: error.message });
  }
};

const handleProductSearch = async (req, res) => {
  const { query, limit } = req.query;
  if (!query) {
    return res.status(400).json({
      status: 0,
      msg: "Search query is required",
    });
  }

  try {
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
  } catch (error) {
    res.status(500).json({
      status: 0,
      msg: `Server Error :${error.message}`,
    });
  }
};

module.exports = {
  handleGetProducts,
  handleToggleFeatured,
  handleUpdateProduct,
  handleCreateProduct,
  handleProductSearch,
};

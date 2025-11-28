const Product = require("../models/productSchema");
const uploadBuffer = require("../utils/cloudinaryUpload");
const parseNumbers = require("../utils/parseNumber");

const handleToggleFeatured = async (req, res) => {
  try {
    const { isFeatured, _id } = req.body;
    if (!_id || typeof isFeatured === "undefined") {
      return res.status(400).json({
        status: 0,
        msg: "Please provide all details to updated the featured status ",
      });
    }
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
const handleEditProduct = async (req, res) => {
  try {
    const { id, ...updates } = req.body;
    if (!id || Object.keys(updates).length === 0) {
      return res.status(400).json({
        status: 0,
        msg: "please provide product id and updates",
      });
    }
    for (const key in updates) {
      if (updates[key] === "true") updates[key] = true;
      else if (updates[key] === "false") updates[key] = false;
      else if (!isNaN(updates[key])) updates[key] = Number(updates[key]);
    }

    const updateProduct = await Product.findByIdAndUpdate(
      { id },
      { $set: updates },
    );

    if (updateProduct.matchedCount === 0) {
      return res.status(404).json({
        status: 0,
        msg: "Didn't find any product.",
      });
    }
    res.status(200).json({
      status: 1,
      msg: "Products Details updated sucessfully..",
      updateProduct: updateProduct,
    });
  } catch (error) {
    res.status(500).json({
      status: 0,
      msg: `Server Error :${error.message}`,
    });
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
        "products/thumbnails",
      );
      thumbnailUrl = result.secure_url;
    }

    // Upload images
    if (req.files?.images) {
      for (const img of req.files.images) {
        const result = await uploadBuffer(img.buffer, "products/images");
        imagesUrls.push(result.secure_url);
      }
    }

    // Convert numeric formData values
    let productDetails = parseNumbers(req.body);

    // Extract discount correctly
    const discount = {
      discount: Number(productDetails.discount) || 0,
      type: productDetails.type || "no-offers",
    };

    // Remove discount fields from req.body
    delete productDetails.discount;
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
    res.status(400).json({ status: 0, msg: error.message });
  }
};

module.exports = {
  handleToggleFeatured,
  handleEditProduct,
  handleCreateProduct,
};

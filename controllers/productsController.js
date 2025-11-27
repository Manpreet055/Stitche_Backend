const Product = require("../models/productSchema");
const uploadBuffer = require("../utils/cloudinaryUpload");

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
    let productDetails = req.body;
    if (!productDetails || Object.keys(productDetails).length === 0) {
      return res.status(400).json({
        status: 0,
        msg: "Please Provide Product details",
      });
    }
    console.log(req.body);
    let imagesUrls = [];
    let thumbnailUrl = "";

    // if (productDetails.thumbnail) {
    //   const file = productDetails.thumbnail;
    //   const result = await uploadBuffer(file.buffer, "products/thumbnails");
    //   thumbnailUrl = result.secure_url;
    // }

    // if (productDetails.images) {
    //   for (const file of productDetails.images) {
    //     const result = await uploadBuffer(file.buffer, "products/images");
    //     imagesUrls.push(result.secure_url);
    //   }
    // }

    // const media = {
    //   images: imagesUrls,
    //   thumbnail: thumbnailUrl,
    // };

    // productDetails = {
    //   ...productDetails,
    //   rating: {
    //     average: 0,
    //     count: 0,
    //   },
    //   media,
    // };

    console.log(productDetails);
    const CreateProduct = await Product.create(productDetails);
    res.status(201).json({
      status: 1,
      msg: "Product Created Successfully",
      createdProduct: CreateProduct,
    });
  } catch (error) {
    if (error.name == "ValidationError") {
      throw new Error("Invalid Product Data ..");
    }
    console.log(error.message);

    res.status(400).json({
      status: 0,
      msg: `Server Error: ${error.message}`,
    });
  }
};

module.exports = {
  handleToggleFeatured,
  handleEditProduct,
  handleCreateProduct,
};

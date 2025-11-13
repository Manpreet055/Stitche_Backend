const Product = require("../models/productSchema");

const handleToggleFeatured = async (req, res) => {
  try {
    const { isFeatured, id } = req.body;
    if (!id || typeof isFeatured === "undefined") {
      return res.status(400).json({
        status: 0,
        msg: "Please provide all details to updated the featured status ",
      });
    }
    const updateFeaturedStatus = await Product.findByIdAndUpdate(
      { id },
      {
        $set: {
          isFeatured: isFeatured,
        },
      },
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

module.exports = {
  handleToggleFeatured,
  handleEditProduct,
};

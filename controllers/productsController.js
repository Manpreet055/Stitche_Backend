const { connectMongoDB } = require("../config/connectMongoDB");
const { ObjectId } = require("mongodb");

const handleGetAllProducts = async (req, res) => {
  try {
    const Products = await connectMongoDB("products");
    let { limit, page } = req.query;
    limit = parseInt(limit) || 10;
    page = parseInt(page) || 1;
    const skip = (page - 1) * limit;
    const length = await Products.find().count();
    const totalPages = Math.ceil(length / limit);

    const allProducts = await Products.find(
      {},
      {
        projection: {
          _id: 1,
          title: 1,
          brand: 1,
          price: 1,
          stock: 1,
          category: 1,
          rating: 1,
        },
      },
    )
      .sort({ _id: 1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    res.status(200).json({
      status: 1,
      msg: "Data fetched successfully ",
      totalPages: totalPages,
      products: allProducts,
    });
  } catch (error) {
    res.status(500).json({
      status: 0,
      msg: `Server Error : ${error.message}`,
    });
  }
};

const handleFindProductById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      res.status(400).json({
        status: 0,
        msg: "Product Id is not valid",
      });
    }

    const Products = await connectMongoDB("products");
    const foundProduct = await Products.findOne({ _id: new ObjectId(id) });

    if (!foundProduct) {
      res.status(404).json({
        status: 0,
        msg: "Product not found",
      });
    }
    res.status(200).json({
      status: 1,
      msg: "Data fetching Successful",
      product: foundProduct,
    });
  } catch (error) {
    res.status(500).json({
      status: 0,
      msg: `Something went wrong:${error.message}`,
    });
  }
};

const handleToggleFeatured = async (req, res) => {
  try {
    const { isFeatured, _id } = req.body;
    if (!_id || typeof isFeatured === "undefined") {
      return res.status(400).json({
        status: 0,
        msg: "Please provide all details to updated the featured status ",
      });
    }
    const Products = await connectMongoDB("products");
    const updateFeaturedStatus = await Products.updateOne(
      { _id: new ObjectId(_id) },
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
module.exports = {
  handleGetAllProducts,
  handleFindProductById,
  handleToggleFeatured,
};

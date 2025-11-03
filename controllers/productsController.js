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

    const allProducts = await Products.find().sort({_id:1}).skip(skip).limit(limit).toArray();

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


const handleSearchProducts = async (req, res) => {
  try {
    const Products = await connectMongoDB("products");
    const { query,limit } = req.query;
    
    if (!query) {
      return res.status(400).json({
        status: 0,
        msg: "Search query is required",
      });
    }
    
    const searchResults = await Products.aggregate([
      {
        $search: {
          index: "products",
          text: {
            query:query,
            path: [
              "name",
              "title",
              "category",
              "brand",
              "subCategory",
            ],
            fuzzy: { maxEdits: 2 },
          },
        },
      },
      { $limit: limit || 10 },
    ]).toArray();
    
    res.status(200).json({
      status: 1,
      msg: "Data fetched successfully",
      products: searchResults,
    });
  } catch (error) {
    res.status(500).json({
      status: 0,
      msg: `Server Error: ${error.message}`,
    });
  }
};

module.exports = { handleGetAllProducts, handleFindProductById, handleSearchProducts};

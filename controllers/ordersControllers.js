const { connectMongoDB } = require("../config/connectMongoDB");
const { ObjectId } = require("mongodb");

const handleGetOrders = async (req, res) => {
  try {
    const Orders = await connectMongoDB("orders");
    let { limit, page } = req.query;
    limit = parseInt(limit) || 10;
    page = parseInt(page) || 1;
    const skip = (page - 1) * limit;
    const length = await Orders.find().count();
    const totalPages = Math.ceil(length / limit);

    const data = await Orders.find()
      .sort({ createdAt: 1, _id: 1 })
      .skip(skip)
      .limit(limit)
      .toArray();
    res.send({
      status: 1,
      msg: "Data fetched..",
      totalPages: totalPages,
      orders: data,
    });
  } catch (err) {
    res.status(500).send({
      status: 0,
      msg: `Server Error : ${err.message}`,
    });
  }
};

const handleFindOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      res.status(400).json({
        status: 0,
        msg: "Order Id is not valid",
      });
    }

    const Orders = await connectMongoDB("orders");
    const foundOrder = await Orders.findOne({ _id: new ObjectId(id) });

    if (!foundOrder) {
      res.status(404).json({
        status: 0,
        msg: "Order not found",
      });
    }
    res.status(200).json({
      status: 1,
      msg: "Data fetching Successful",
      order: foundOrder,
    });
  } catch (error) {
    res.status(500).json({
      status: 0,
      msg: `Server Error :${error.message}`,
    });
  }
};

const handleSearchOrders = async (req, res) => {
  try {
    const Orders = await connectMongoDB("orders");
    const { query,limit } = req.query;

    if (!query) {
      return res.status(400).json({
        status: 0,
        msg: "Search query is required",
      });
    }

    const searchResults = await Orders.aggregate([
      {
        $search: {
          index: "orders",
          text: {
            query: query,
            path: [
              "orderId",
              "user.username",
              "user.email",
              "user.firstName",
              "user.lastName",
              "user.phone",
              "shipping.address",
              "shipping.city",
              "shipping.country",
              "shipping.postalCode",
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
      orders: searchResults,
    });
  } catch (error) {
    res.status(500).json({
      status: 0,
      msg: `Server Error: ${error.message}`,
    });
  }
};

module.exports = {
  handleGetOrders,
  handleFindOrderById,
  handleSearchOrders
};

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

    const data = await Orders.find(
      {},
      {
        projection: {
          _id: 1,
          products: 1,
          totalAmount: 1,
          payment: 1,
          shipping: 1,
          status: 1,
          user: 1,
        },
      },
    )
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

module.exports = {
  handleGetOrders,
  handleFindOrderById,
};

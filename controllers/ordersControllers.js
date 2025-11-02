const { connectMongoDB } = require("../config/connectMongoDB");
const { ObjectId } = require("mongodb");

const handleGetOrders = async (req, res) => {
  try {
    let { limit } = req.query;
    const Orders = await connectMongoDB("orders");

    if (limit) {
      limit = parseInt(limit);
      if (!Number.isFinite(limit) || limit <= 0) limit = 10;
      const MAX_LIMIT = 100;
      if (limit > MAX_LIMIT) limit = MAX_LIMIT; // cap to avoid abuse

      const data = await Orders.find()
        .sort({ createdAt: -1, _id: -1 })
        .limit(limit)
        .toArray();
      res.send({
        status: 1,
        msg: "Data fetched..",
        orders: data,
      });
    }
    const data = await Orders.find().sort({ createdAt: 1, _id: 1 }).toArray();
    res.send({
      status: 1,
      msg: "Data fetched..",
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

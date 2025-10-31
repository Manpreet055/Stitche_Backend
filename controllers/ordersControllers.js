const { dbConnection } = require("../config/db");
const connectMongoDB = require("../config/connectMongoDB");

const handleGetAllOrders = async (req, res) => {
  try {
    const Orders = await connectMongoDB("orders");
    const data = await Orders.find().toArray();
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

module.exports = {handleGetAllOrders};

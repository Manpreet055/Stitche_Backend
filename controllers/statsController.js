const { connectMongoDB } = require("../config/connectMongoDB");

const handleGetstats = async (req, res) => {
  try {
    const Users = await connectMongoDB("users");
    const Orders = await connectMongoDB("orders");

    const [getUsersCount, getPendingOrdersCount] = await Promise.all([
      Users.countDocuments(),
      Orders.countDocuments({ "status.orderStatus": "pending" }),
    ]);

    res.status(200).json({
      status: 1,
      msg: "Count completed",
      usersCount: getUsersCount,
      ordersCount: getPendingOrdersCount,
    });
  } catch (error) {
    res.status(500).json({
      status: 0,
      msg: `Server Error : ${error.message}`,
    });
  }
};

module.exports = handleGetstats;

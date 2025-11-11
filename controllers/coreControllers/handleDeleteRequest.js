const User = require("../models/UserSchema");
const Product = require("../../models/productSchema");
const Inbox = require("../models/inboxSchema");
const Order = require("../../models/orderSchema");

const deleteDataById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id)
      return res.status(400).json({ status: 0, msg: "Please provide a Id" });

    const selectSchema = {
      users: User,
      products: Product,
      orders: Order,
      inbox: Inbox,
    };

    const allowedCols = ["products", "orders", "users", "inbox"];

    if (!allowedCols.includes(schema)) throw new Error("Invalid schema name");

    const selectedSchema = selectSchema[schema];

    const deleteData = await selectedSchema.findByIdAndDelete(id);

    if (!deleteData) {
      return res.status(404).json({
        status: 0,
        msg: "No data found",
      });
    }

    res.status(200).json({
      status: 1,
      msg: "Data deleted successfully.",
      data: deleteData,
    });
  } catch (error) {
    res.status(500).json({
      status: 0,
      msg: `Server Error: ${error.message}`,
    });
  }
};

module.exports = deleteDataById;

const User = require("../models/UserSchema");
const Product = require("../../models/productSchema");
const Inbox = require("../models/inboxSchema");
const Order = require("../../models/orderSchema");

const sortData = async (req, res) => {
  try {
    const { sortingOrder, sortField, schema } = req.query;

    if (!schema)
      return res
        .status(400)
        .json({ status: 0, msg: "Please provide a schema name" });

    const selectSchema = {
      users: User,
      products: Product,
      orders: Order,
      inbox: Inbox,
    };

    const allowedCols = ["products", "orders", "users", "inbox"];
    if (!allowedCols.includes(schema)) throw new Error("Invalid schema name");

    const selectedSchema = selectSchema[schema];

    if (!sortField)
      return res.status(400).json({
        status: 0,
        msg: "Please provide a sort field",
      });

    const order = sortingOrder === "desc" ? -1 : 1;

    const sortedData = await selectedSchema.find().sort({ [sortField]: order });

    if (!sortedData.length) {
      return res.status(404).json({
        status: 0,
        msg: "No data found",
      });
    }

    res.status(200).json({
      status: 1,
      msg: "Data sorted successfully",
      data: sortedData,
    });
  } catch (error) {
    res.status(500).json({
      status: 0,
      msg: `Server Error: ${error.message}`,
    });
  }
};

const filterData = async (req, res) => {
  try {
    const { schema, ...filters } = req.query;
    if (!schema)
      return res
        .status(400)
        .json({ status: 0, msg: "Please provide a schema name" });

    for (const key in filters) {
      if (filters[key] === "true") filters[key] = true;
      else if (filters[key] === "false") filters[key] = false;
      else if (!isNaN(filters[key])) filters[key] = Number(filters[key]);
    }

    const selectSchema = {
      users: User,
      products: Product,
      orders: Order,
      inbox: Inbox,
    };

    const allowedCols = ["products", "orders", "users", "inbox"];
    if (!allowedCols.includes(schema)) throw new Error("Invalid schema name");

    const selectedSchema = selectSchema[schema];

    if (Object.keys(filters).length === 0) {
      return res.status(400).json({
        status: 0,
        msg: "Please provide filters",
      });
    }
    const filteredData = await selectedSchema.find(filters).lean();

    if (!filteredData.length) {
      return res.status(404).json({
        status: 0,
        msg: "No data found",
      });
    }

    res.status(200).json({
      status: 1,
      msg: "Data filtration successful.",
      resultsCount: filteredData.length,
      data: filteredData,
    });
  } catch (error) {
    res.status(500).json({
      status: 0,
      msg: `Server Error: ${error.message}`,
    });
  }
};

module.exports = { sortData, filterData };

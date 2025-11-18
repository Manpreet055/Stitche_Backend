const User = require("../models/userSchema");
const Product = require("../models/productSchema");
const Inbox = require("../models/messageSchema");
const Order = require("../models/orderSchema");
const validateSchema = require("../utils/validateSchema");
const { ObjectId } = require("mongodb");

const handleGetAllData = async (req, res) => {
  try {
    const { schema } = req.params;
    const selectedSchema = validateSchema(schema);
    let { limit, page, sortingOrder, sortField, ...filters } = req.query;
    limit = parseInt(limit) || 10;
    page = parseInt(page) || 1;
    const skip = (page - 1) * limit;
    const length = await selectedSchema.countDocuments();
    const totalPages = Math.ceil(length / limit);

    const order = sortingOrder === "desc" ? -1 : 1;

    for (const key in filters) {
      if (filters[key] === "true") filters[key] = true;
      else if (filters[key] === "false") filters[key] = false;
      else if (!isNaN(filters[key])) filters[key] = Number(filters[key]);
    }

    const allData = await selectedSchema
      .find(filters)
      .sort(sortField ? { [sortField]: order } : { _id: 1 })
      .skip(skip)
      .limit(limit)
      .lean();

    res.status(200).json({
      status: 1,
      msg: "Data fetched successfully ",
      totalPages: totalPages,
      data: allData,
    });
  } catch (error) {
    const statusCode = error?.statusCode || 500;
    res.status(statusCode).json({
      status: 0,
      msg: `Server Error : ${error.message}`,
    });
  }
};

const handleGetDataById = async (req, res) => {
  try {
    const { id, schema } = req.params;

    if (!ObjectId.isValid(id)) {
      res.status(400).json({
        status: 0,
        msg: "Id is not valid",
      });
    }

    const selectedSchema = validateSchema(schema);

    const foundData = await selectedSchema.findById(id).lean();

    if (!foundData) {
      res.status(404).json({
        status: 0,
        msg: "Data not found",
      });
    }
    res.status(200).json({
      status: 1,
      msg: "Data fetching Successful",
      data: foundData,
    });
  } catch (error) {
    const statusCode = error?.statusCode || 500;

    res.status(statusCode).json({
      status: 0,
      msg: `Something went wrong:${error.message}`,
    });
  }
};
const handleDeleteDataById = async (req, res) => {
  try {
    const { id, schema } = req.params;

    if (!ObjectId.isValid(id)) {
      res.status(400).json({
        status: 0,
        msg: "Id is not valid",
      });
    }
    const selectedSchema = validateSchema(schema);

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
    const statusCode = error?.statusCode || 500;

    res.status(statusCode).json({
      status: 0,
      msg: `Server Error: ${error.message}`,
    });
  }
};

const handleSearch = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({
        status: 0,
        msg: "Search query is required",
      });
    }

    const searchConfig = [
      {
        model: Product,
        name: "products",
        index: "products_search_index",
        path: ["name", "title", "category", "brand", "subCategory"],
      },
      {
        model: User,
        name: "users",
        index: "users_search_index",
        path: [
          "username",
          "email",
          "role",
          "profile.fullName",
          "profile.phone",
          "profile.address.city",
          "profile.address.country",
          "profile.address.street",
        ],
      },
      {
        model: Order,
        name: "orders",
        index: "orders_search_index",
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
      },
    ];

    const searchResults = await Promise.all(
      searchConfig.map(async (config) => {
        const result = await config.model.aggregate([
          {
            $search: {
              index: config.index,
              text: {
                query: query,
                path: config.path,
                fuzzy: { maxEdits: 2 },
              },
            },
          },
          { $limit: 15 },
        ]);
        return { [config.name]: result };
      }),
    );

    const merged = Object.assign({}, ...searchResults);
    res.status(200).json({
      status: 1,
      msg: "Found these results..",
      results: merged,
    });
  } catch (error) {
    res.status(500).json({
      status: 0,
      msg: `Server Error :${error.message}`,
    });
  }
};

const handleGetstats = async (req, res) => {
  try {
    const [getUsersCount, getPendingOrdersCount] = await Promise.all([
      User.countDocuments(),
      Order.countDocuments({ "status.orderStatus": "pending" }),
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

module.exports = {
  handleGetAllData,
  handleGetDataById,
  handleDeleteDataById,
  handleSearch,
  handleGetstats,
};

const User = require("../models/user.model");
const Product = require("../models/product.model");
const Order = require("../models/order.model");
const validateSchema = require("../utils/validateSchema");
const applyFilters = require("../utils/applyFilters");
const mongoose = require("mongoose");

exports.handleGetAllData = async (req, res) => {
  const { schema } = req.params;
  const selectedSchema = validateSchema(schema); // Validating the schema from where to fetch Data
  let { limit, page, sortingOrder, sortField, ...filters } = req.query;

  filters = applyFilters(filters); // Parsing the filters into what mongoose want

  limit = parseInt(limit) || 10;
  page = parseInt(page) || 1;
  const skip = (page - 1) * limit;
  const length = await selectedSchema.countDocuments(filters);
  const totalPages = Math.ceil(length / limit); //Calculating totalPages and sending it to the frontend for ease

  const order = sortingOrder === "desc" ? -1 : 1;

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
};

exports.handleGetDataById = async (req, res) => {
  const { id, schema } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      status: 0,
      msg: "Id is not valid",
    });
  }

  const selectedSchema = validateSchema(schema);

  const foundData = await selectedSchema.findById(id).lean();

  if (!foundData) {
    return res.status(404).json({
      status: 0,
      msg: "Data not found",
    });
  }
  res.status(200).json({
    status: 1,
    msg: "Data fetching Successful",
    data: foundData,
  });
};

exports.handleDeleteDataById = async (req, res) => {
  const { id, schema } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
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
};

exports.handleSearch = async (req, res) => {
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
};

exports.handleGetstats = async (req, res) => {
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
};

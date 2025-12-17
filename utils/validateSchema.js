const User = require("../models/user.model");
const Product = require("../models/product.model");
const Inbox = require("../models/message.model");
const Order = require("../models/order.model");

const validateSchema = (schema) => {
  if (!schema) {
    const error = new Error("Please provide a schema name..");
    error.statusCode = 400;
    throw error;
  }
  const selectSchema = {
    users: User,
    products: Product,
    orders: Order,
    inbox: Inbox,
  };

  const allowedCols = ["products", "orders", "users", "inbox"];
  if (!allowedCols.includes(schema)) {
    const error = new Error("This schema is not allowed..");
    error.statusCode = 400;
    throw error;
  }
  return selectSchema[schema];
};

module.exports = validateSchema;

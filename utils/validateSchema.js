const User = require("../models/userSchema");
const Product = require("../models/productSchema");
const Inbox = require("../models/messageSchema");
const Order = require("../models/orderSchema");

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

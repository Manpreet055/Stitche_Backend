const validateSchema = (schema) => {
  if (!schema) {
    const error = new Error("Please provide a schema name..");
    error.statusCode = 400;
  }
  const selectSchema = {
    users: User,
    products: Product,
    orders: Order,
    inbox: Inbox,
  };

  const allowedCols = ["products", "orders", "users", "messages"];
  if (!allowedCols.includes(schema)) {
    const error = new Error("This schema is not allowed..");
    error.statusCode = 400;
  }
  return selectSchema[schema];
};

module.exports = validateSchema;

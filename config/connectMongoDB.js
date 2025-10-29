const { dbConnection } = require("./db");

const connectMongoDB = async (collectionName) => {
  const client = await dbConnection();
  const db = await client.db("Shop");
  const useCollection = await db.collection(collectionName);
  return useCollection;
};

module.exports = connectMongoDB;

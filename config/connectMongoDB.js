const { MongoClient } = require("mongodb");
require("dotenv").config();

const uri = process.env.URI;
const client = new MongoClient(uri);

let cachedDb = null; // cache the db connection

const connectMongoDB = async (collectionName) => {
  try {
    if (!cachedDb) {
      await client.connect();
      console.log("MongoDB Connection Established...");
      cachedDb =  client.db("Shop");
    }

    const collection = cachedDb.collection(collectionName);
    return collection;

  } catch (error) {
    console.error("MongoDB Connection Failed:", error.message);
    throw error;
  }
};

module.exports = { connectMongoDB };
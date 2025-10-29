const { MongoClient } = require("mongodb");
require("dotenv").config();

const uri = process.env.URI;
const client = new MongoClient(uri);

const dbConnection = async () => {
    await client.connect().then(()=>console.log("DB Connection is Established.."));
   return client;
};

module.exports = {dbConnection}
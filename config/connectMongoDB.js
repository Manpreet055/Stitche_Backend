const { mongoose } = require("mongoose");
require("dotenv").config();

const connectMongoDB = () => {
  mongoose
    .connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => console.log("MongoDB Connection Established.."))
    .catch((err) => console.log("MongoDB Connection Failed..", err.message));
};

module.exports = connectMongoDB;

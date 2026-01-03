require("dotenv").config();
const port = process.env.PORT || 3000;
const connectMongoDB = require("../config/connectMongoDB");

//Middlewares
const cors = require("cors");
const morgan = require("morgan");
const express = require("express");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const rateLimiter = require("../middlewares/rateLimiter.middleware");

// All routes
const coreRoute = require("../routes/core.route");
const userRoute = require("../routes/user.route");
const cartRoute = require("../routes/cart.route");
const inboxRoute = require("../routes/inbox.route");
const orderRoute = require("../routes/order.route");
const productRoute = require("../routes/product.route");

const app = express();
connectMongoDB();
app.set("trust proxy", 1);

// Initializing Middlewares
app.use(
  morgan("dev", {
    //this is the middleware used to check the incoming logs
    skip: (req) => req.method === "OPTIONS",
  }),
);
app.use(express.json());
app.use(cookieParser());
app.use(helmet());
app.use(
  cors({
    origin: [
      "http://localhost:5174",
      "http://172.16.17.149:5173",
      "http://localhost:5173", // Remove trailing slashes
      process.env.CORS_ORIGIN,
    ],
    credentials: true,
  }),
);
// Routes prefixes
app.use("/api", rateLimiter, coreRoute);
app.use("/products", rateLimiter, productRoute);
app.use("/users", rateLimiter, userRoute);
app.use("/cart", rateLimiter, cartRoute);
app.use("/inbox", rateLimiter, inboxRoute);
app.use("/orders", rateLimiter, orderRoute);

// app.listen(port, () => {
//   console.log(`Server is running on port ${port}`);
// });

module.exports = app;

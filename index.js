require("dotenv").config();
const port = process.env.PORT || 3000;
const connectMongoDB = require("./config/connectMongoDB");

//Middlewares
const cors = require("cors");
const express = require("express");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const rateLimiter = require("./middlewares/rateLimiter.middleware");

// All routes
const coreRoute = require("./routes/core.route");
const userRoute = require("./routes/user.route");
const cartRoute = require("./routes/cart.route");
const inboxRoute = require("./routes/inbox.route");
const orderRoute = require("./routes/order.route");
const productRoute = require("./routes/product.route");

const app = express();
connectMongoDB();

// Initializing Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(helmet());
app.use("/api/", rateLimiter);
app.use(
  cors({
    origin: "http://localhost:5173", // frontend URL
    credentials: true,
  }),
);

// Routes prefixes
app.use("/api", coreRoute);
app.use("/products", productRoute);
app.use("/users", userRoute);
app.use("/cart", cartRoute);
app.use("/inbox", inboxRoute);
app.use("/order", orderRoute);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

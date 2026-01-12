require("dotenv").config();
const port = process.env.PORT || 3000;
const connectMongoDB = require("./config/connectMongoDB");

//Middlewares
const cors = require("cors");
const morgan = require("morgan");
const express = require("express");
const helmet = require("helmet");
const { handleFileError } = require("./middlewares/multer.middleware");
const cookieParser = require("cookie-parser");
const rateLimiter = require("./middlewares/rateLimiter.middleware");
const errorHandler = require("./middlewares/errorHandler.middleware");

// All routes
const coreRoute = require("./routes/core.route");
const userRoute = require("./routes/user.route");
const cartRoute = require("./routes/cart.route");
const inboxRoute = require("./routes/inbox.route");
const orderRoute = require("./routes/order.route");
const productRoute = require("./routes/product.route");

const app = express();
app.use(async (req, res, next) => {
  try {
    await connectMongoDB();
    next();
  } catch (e) {
    next(e);
  }
});
app.set("trust proxy", 1); // trust first proxy

// Initializing Middlewares
app.use(
  morgan("dev", {
    //this is the middleware used to check the incoming logs
    skip: (req) => req.method === "OPTIONS",
  }),
);
app.use(express.json({ limit: "10mb" })); // to handle JSON payloads
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());
app.use(helmet());

app.use(
  cors({
    origin: function (origin, callback) {
      const allowedOrigins =
        process.env.NODE_ENV === "production"
          ? [process.env.CORS_ORIGIN] // must be set in Vercel
          : [
              "http://localhost:5173",
              "http://localhost:5174",
              "http://172.16.17.149:5173",
            ];

      // Allow requests with no origin (like mobile apps, Postman, curl)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    maxAge: 86400, // 24 hours
  }),
);

// Routes prefixes
app.use("/api", rateLimiter, coreRoute);
app.use("/products", rateLimiter, productRoute);
app.use("/users", rateLimiter, userRoute);
app.use("/cart", rateLimiter, cartRoute);
app.use("/inbox", rateLimiter, inboxRoute);
app.use("/orders", rateLimiter, orderRoute);
app.use("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

app.use(errorHandler); // global error handler
app.use(handleFileError); // multer file upload error handler

// Starting the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

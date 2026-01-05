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
app.set("trust proxy", 1);

// Initializing Middlewares
app.use(
  morgan("dev", {
    //this is the middleware used to check the incoming logs
    skip: (req) => req.method === "OPTIONS",
  })
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
    maxAge: 86400,
  })
);
// Routes prefixes
app.use("/api", rateLimiter, coreRoute);
app.use("/products", rateLimiter, productRoute);
app.use("/users", rateLimiter, userRoute);
app.use("/cart", rateLimiter, cartRoute);
app.use("/inbox", rateLimiter, inboxRoute);
app.use("/orders", rateLimiter, orderRoute);
app.get("/favicon.ico", (req, res) => res.status(204).end());
app.get("/favicon.png", (req, res) => res.status(204).end()); // Handle favicon requests

// Health check endpoint
app.get("/health", async (req, res) => {
  try {
    await connectMongoDB();
    res.status(200).json({
      status: "ok",
      timestamp: new Date().toISOString(),
      mongodb: "connected",
    });
  } catch (error) {
    res.status(503).json({
      status: "error",
      timestamp: new Date().toISOString(),
      mongodb: "disconnected",
      error: error.message,
    });
  }
});

// 404 handler - must be after all routes
app.use((req, res) => {
  res.status(404).json({
    status: 0,
    msg: "Route not found",
  });
});

// Global error handler - must be last
app.use((err, req, res) => {
  console.error("Unhandled error:", err);
  res.status(err.statusCode || 500).json({
    status: 0,
    msg: err.message || "Internal server error",
  });
});

// Only start server when running locally (not in Vercel)
if (process.env.NODE_ENV !== "production" && require.main === module) {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

// Serverless handler for Vercel
module.exports = async (req, res) => {
  try {
    await connectMongoDB();
    return app(req, res);
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    return res.status(500).json({
      status: 0,
      msg: "Database connection failed",
    });
  }
};

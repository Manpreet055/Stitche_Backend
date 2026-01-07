const errorHandler = (err, req, res, next) => {
  // Default to 500 if no status code is set
  const statusCode = err.statusCode || err.status || 500;

  // Log error details in development
  if (process.env.NODE_ENV !== "production") {
    console.error("Error Stack:", err.stack);
    console.error("Error Details:", err);
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      status: 0,
      msg: "Validation Error",
      errors,
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({
      status: 0,
      msg: `${field} already exists`,
    });
  }

  // Mongoose CastError (invalid ObjectId)
  if (err.name === "CastError") {
    return res.status(400).json({
      status: 0,
      msg: `Invalid ${err.path}: ${err.value}`,
    });
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      status: 0,
      msg: "Invalid token. Please log in again.",
    });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      status: 0,
      msg: "Token expired. Please log in again.",
    });
  }

  // Generic error response
  res.status(statusCode).json({
    status: 0,
    msg: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
};

module.exports = errorHandler;

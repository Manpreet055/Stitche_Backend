const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || err.status || 500;
  const isProd = process.env.NODE_ENV === "production";

  // Always log errors on server
  console.error(err);

  // Mongoose validation error
  if (err.name === "ValidationError") {
    return res.status(400).json({
      status: 0,
      msg: "Validation Error",
      errors: Object.values(err.errors).map((e) => e.message),
    });
  }

  // Duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({
      status: 0,
      msg: `${field} already exists`,
    });
  }

  // Invalid ObjectId
  if (err.name === "CastError") {
    return res.status(400).json({
      status: 0,
      msg: "Invalid ID format",
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

  // Generic error (SAFE)
  res.status(statusCode).json({
    status: 0,
    msg: isProd ? "Something went wrong" : err.message,
    ...(isProd ? {} : { stack: err.stack }),
  });
};

module.exports = errorHandler;

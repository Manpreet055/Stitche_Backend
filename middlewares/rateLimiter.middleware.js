const { rateLimit } = require("express-rate-limit");

const rateLimiter = rateLimit({
  windowMs: 15 * 6 * 1000,
  max: 100,
  message: "Too many requests, Please try again later..",
});

module.exports = rateLimiter;

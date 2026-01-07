const asyncHandler = (fn) => {
  return async function (req, res, next) {
    try {
      await fn(req, res, next);
    } catch (error) {
      next(error); // Pass error to the next middleware
    }
  };
};

module.exports = asyncHandler;

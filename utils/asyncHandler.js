const asyncHandler = (fn) => {
  return async function (req, res, next = () => {}) {
    try {
      const results = await fn(req, res, next);
      return results;
    } catch (error) {
      if (error?.errorResponse?.code === 11000) {
        return res.status(409).json({
          status: 0,
          msg: "Email or username already exist",
        });
      }
      res.status(error.statusCode || 500).json({
        status: 0,
        msg: error.message,
      });
    }
  };
};

module.exports = asyncHandler;

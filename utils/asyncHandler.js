const asyncHandler = (fn) => {
  return async function (req, res, next = () => {}) {
    try {
      const results = await fn(req, res, next);
      return results;
    } catch (error) {
      res.status(500).json({
        status: 0,
        msg: error.message,
      });
    }
  };
};

module.exports = asyncHandler;

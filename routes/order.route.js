const express = require("express");
const { authMiddleware } = require("../middlewares/auth.middleware");
const {
  handleGetOrderDataById,
  handleDeleteOrderById,
} = require("../controllers/order.controller");
const asyncHandler = require("../utils/asyncHandler");
const router = express.Router();

router
  .route("/:id")
  .get(asyncHandler(handleGetOrderDataById))
  .delete(asyncHandler(handleDeleteOrderById));

module.exports = router;

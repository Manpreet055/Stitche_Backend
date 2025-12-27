const express = require("express");
const { authMiddleware } = require("../middlewares/auth.middleware");
const {
  handleGetOrderDataById,
  handleDeleteOrderById,
  handlePlaceOrder,
  handleGetOrderHistory,
} = require("../controllers/order.controller");
const asyncHandler = require("../utils/asyncHandler");
const router = express.Router();

router
  .route("/:id")
  .get(asyncHandler(handleGetOrderDataById))
  .delete(asyncHandler(handleDeleteOrderById));

router
  .route("/")
  .get(authMiddleware, asyncHandler(handleGetOrderHistory))
  .post(authMiddleware, handlePlaceOrder);

module.exports = router;

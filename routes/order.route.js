const express = require("express");
const { authMiddleware } = require("../middlewares/authentication.middleware");
const {
  handleGetOrderDataById,
  handleDeleteOrderById,
  handlePlaceOrder,
  handleGetOrderHistory,
  handleOrderCancellation,
} = require("../controllers/order.controller");
const asyncHandler = require("../utils/asyncHandler");
const router = express.Router();
const { verifyAdmin } = require("../middlewares/authorization.middleware");
router
  .route("/:id")
  .get(authMiddleware, asyncHandler(handleGetOrderDataById))
  .patch(authMiddleware, asyncHandler(handleOrderCancellation))
  .delete(authMiddleware, verifyAdmin, handleDeleteOrderById);

router
  .route("/")
  .get(authMiddleware, asyncHandler(handleGetOrderHistory))
  .post(authMiddleware, handlePlaceOrder);

module.exports = router;

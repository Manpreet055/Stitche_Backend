const express = require("express");
const { authMiddleware } = require("../middlewares/auth.middleware");
const {
  handleGetOrderDataById,
  handleDeleteOrderById,
  handlePlaceOrder,
} = require("../controllers/order.controller");
const asyncHandler = require("../utils/asyncHandler");
const router = express.Router();

router
  .route("/:id")
  .get(asyncHandler(handleGetOrderDataById))
  .delete(asyncHandler(handleDeleteOrderById));

router.post("/", authMiddleware, handlePlaceOrder);

module.exports = router;

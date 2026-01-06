const express = require("express");
const { authMiddleware } = require("../middlewares/authentication.middleware");
const {
  handleGetCartData,
  handleUpdateCartQty,
  handleAddProductToCart,
  handleRemoveProductFromCart,
} = require("../controllers/cart.controller");
const asyncHandler = require("../utils/asyncHandler");
const router = express.Router();

router
  .route("/")
  .get(authMiddleware, asyncHandler(handleGetCartData))
  .patch(authMiddleware, asyncHandler(handleAddProductToCart))
  .delete(authMiddleware, asyncHandler(handleRemoveProductFromCart));

router.patch("/update", authMiddleware, asyncHandler(handleUpdateCartQty));

module.exports = router;

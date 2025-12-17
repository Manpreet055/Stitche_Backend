const express = require("express");
const { authMiddleware } = require("../middlewares/auth.middleware");
const {
  handleGetCartData,
  handleUpdateCartQty,
  handleAddProductToCart,
  handleRemoveProductFromCart,
} = require("../controllers/cart.controller");

const router = express.Router();

router
  .route("/")
  .get(authMiddleware, handleGetCartData)
  .patch(authMiddleware, handleAddProductToCart)
  .delete(authMiddleware, handleRemoveProductFromCart);

router.patch("/update", authMiddleware, handleUpdateCartQty);

module.exports = router;

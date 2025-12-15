const express = require("express");
const {
  handleLogin,
  handleSignup,
  handleAddProductToCart,
  handleGetUserById,
  handleRemoveProductFromCart,
  handleCartQty,
} = require("../controllers/usersControllers");

const { jwtAuthMiddleware } = require("../middlewares/jwtAuthMiddleware");
const getAccessToken = require("../middlewares/getAcessToken");

const router = express.Router();

router.post("/login", handleLogin);
router.post("/signup", handleSignup);

// Cart Routes
router
  .route("/cart")
  .patch(jwtAuthMiddleware, handleAddProductToCart)
  .delete(jwtAuthMiddleware, handleRemoveProductFromCart);

router.post("/refresh-token", getAccessToken);
router.patch("/cart/update", jwtAuthMiddleware, handleCartQty);

router.route("/").get(jwtAuthMiddleware, handleGetUserById);

module.exports = router;

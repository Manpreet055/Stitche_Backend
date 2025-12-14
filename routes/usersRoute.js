const express = require("express");
const {
  handleLogin,
  handleSignup,
  handleAddProductToCart,
  handleGetUserById,
  handleRemoveProductFromCart,
  handleCartQty,
} = require("../controllers/usersControllers");

const router = express.Router();

router.get("/login", handleLogin);
router.post("/signup", handleSignup);

// Cart Routes
router
  .route("/cart")
  .patch(handleAddProductToCart)
  .delete(handleRemoveProductFromCart);

router.patch("/cart/update", handleCartQty);

router.route("/:id").get(handleGetUserById);

module.exports = router;

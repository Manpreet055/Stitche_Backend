const express = require("express");
const {
  handleLogin,
  handleAddProductToCart,
  handleGetUserById,
  handleRemoveProductFromCart,
} = require("../controllers/usersControllers");

const router = express.Router();

router.get("/login", handleLogin);
router.route("/:id").get(handleGetUserById);

// Cart Routes
router
  .route("/cart")
  .patch(handleAddProductToCart)
  .delete(handleRemoveProductFromCart);

module.exports = router;

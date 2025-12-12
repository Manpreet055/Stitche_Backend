const express = require("express");
const {
  handleLogin,
  handleCart,
  handleGetUserById,
} = require("../controllers/usersControllers");

const router = express.Router();

router.get("/login", handleLogin);
router.route("/:id").get(handleGetUserById);
router.patch("/cart/:userId", handleCart);

module.exports = router;

const express = require("express");
const { authMiddleware } = require("../middlewares/auth.middleware");
const {
  handleGetOrderDataById,
  handleDeleteOrderById,
} = require("../controllers/order.controller");

const router = express.Router();

router.route("/:id").get(handleGetOrderDataById).delete(handleDeleteOrderById);

module.exports = router;

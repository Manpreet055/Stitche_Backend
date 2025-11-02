const express = require("express");
const {
  handleGetOrders,
  handleFindOrderById,
} = require("../controllers/ordersControllers");

const router = express.Router();

router.get("/", handleGetOrders);
router.get("/:id", handleFindOrderById);

module.exports = router;

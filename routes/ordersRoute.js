const express = require("express");
const {
  handleGetOrders,
  handleFindOrderById,
  filterOrders,
} = require("../controllers/ordersControllers");

const router = express.Router();

router.get("/", handleGetOrders);
router.get("/:id", handleFindOrderById);
router.get("/filter", filterOrders);

module.exports = router;

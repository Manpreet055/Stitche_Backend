const express = require("express");
const {
  handleGetOrders,
  handleFindOrderById,
  handleSearchOrders
} = require("../controllers/ordersControllers");

const router = express.Router();

router.get("/", handleGetOrders);
router.get("/search", handleSearchOrders );
router.get("/:id", handleFindOrderById);

module.exports = router;

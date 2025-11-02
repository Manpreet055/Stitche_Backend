const express = require("express");
const {
  handleGetAllProducts,
  handleFindProductById,
} = require("../controllers/productsController");

const router = express.Router();

router.get("/", handleGetAllProducts);
router.get("/:id", handleFindProductById);

module.exports = router;

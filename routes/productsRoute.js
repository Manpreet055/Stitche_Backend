const express = require("express");
const {
  handleGetAllProducts,
  handleFindProductById,
  handleSearchProducts
} = require("../controllers/productsController");

const router = express.Router();

router.get("/", handleGetAllProducts);
router.get("/search", handleSearchProducts);
router.get("/:id", handleFindProductById);

module.exports = router;

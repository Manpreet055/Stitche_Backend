const express = require("express");
const {
  handleGetAllProducts,
  handleFindProductById,
  handleToggleFeatured,
} = require("../controllers/productsController");

const router = express.Router();

router.route("/").get(handleGetAllProducts).patch(handleToggleFeatured);
router.get("/:id", handleFindProductById);

module.exports = router;

const express = require("express");
const {
  handleGetAllProducts,
  handleFindProductById,
  handleToggleFeatured,
  handleEditProduct,
  filterProducts,
} = require("../controllers/productsController");

const router = express.Router();

router.route("/").get(handleGetAllProducts).patch(handleToggleFeatured);
router.get("/:id", handleFindProductById);
router.patch("/edit", handleEditProduct);
router.get("/filter", filterProducts);
module.exports = router;

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
router.patch("/edit", handleEditProduct);
router.get("/filter", filterProducts);
router.get("/:id", handleFindProductById);
module.exports = router;

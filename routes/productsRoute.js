const express = require("express");
const {
  handleGetAllProducts,
  handleFindProductById,
  handleToggleFeatured,
  handleEditProduct,
} = require("../controllers/productsController");

const router = express.Router();

router.route("/").get(handleGetAllProducts).patch(handleToggleFeatured);
router.patch("/edit", handleEditProduct);
router.get("/:id", handleFindProductById);
module.exports = router;

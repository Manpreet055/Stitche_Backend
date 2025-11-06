const express = require("express");
const {
  handleGetAllProducts,
  handleFindProductById,
  handleToggleFeatured,
  handleEditProduct,
} = require("../controllers/productsController");

const router = express.Router();

router.route("/").get(handleGetAllProducts).patch(handleToggleFeatured);
router.get("/:id", handleFindProductById);
router.patch("/edit", handleEditProduct);
module.exports = router;

const express = require("express");
const {
  handleNewImages,
  handleUpdatedImages,
} = require("../middlewares/multer.middleware");

const {
  handleProductSearch,
  handleGetProducts,
  handleToggleFeatured,
  handleUpdateProduct,
  handleCreateProduct,
} = require("../controllers/product.controller");

const router = express.Router();

router
  .route("/")
  .get(handleGetProducts)
  .patch(handleToggleFeatured)
  .post(handleNewImages, handleCreateProduct);
router.patch("/edit/:id", handleUpdatedImages, handleUpdateProduct);
router.get("/search", handleProductSearch);

module.exports = router;

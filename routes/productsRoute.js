const express = require("express");
const {
  handleNewImages,
  handleUpdatedImages,
} = require("../middlewares/multerUploads");

const {
  handleProductSearch,
  handleGetProducts,
  handleToggleFeatured,
  handleUpdateProduct,
  handleCreateProduct,
} = require("../controllers/productsController");

const router = express.Router();

router
  .route("/")
  .get(handleGetProducts)
  .patch(handleToggleFeatured)
  .post(handleNewImages, handleCreateProduct);
router.patch("/edit/:id", handleUpdatedImages, handleUpdateProduct);
router.get("/search", handleProductSearch);

module.exports = router;

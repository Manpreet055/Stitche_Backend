const express = require("express");
const {
  handleNewImages,
  handleUpdatedImages,
} = require("../middlewares/multer.middleware");

const {
  handleProductSearch,
  handleToggleFeatured,
  handleUpdateProduct,
  handleCreateProduct,
  handleGetProducts,
} = require("../controllers/product.controller");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

router
  .route("/")
  .get(asyncHandler(handleGetProducts))
  .patch(asyncHandler(handleToggleFeatured))
  .post(handleNewImages, asyncHandler(handleCreateProduct));

router.patch(
  "/edit/:id",
  handleUpdatedImages,
  asyncHandler(handleUpdateProduct),
);
router.get("/search", asyncHandler(handleProductSearch));

module.exports = router;

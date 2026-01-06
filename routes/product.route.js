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
  handleGetProductDataById,
} = require("../controllers/product.controller");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

router
  .route("/")
  .get(asyncHandler(handleGetProducts))
  .patch(asyncHandler(handleToggleFeatured))
  .post(handleNewImages, asyncHandler(handleCreateProduct));

router
  .route("/:id")
  .get(asyncHandler(handleGetProductDataById))
  .patch(handleUpdatedImages, asyncHandler(handleUpdateProduct));
router.get("/search", asyncHandler(handleProductSearch));

module.exports = router;

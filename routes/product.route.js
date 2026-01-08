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
const { authMiddleware } = require("../middlewares/authentication.middleware");
const { verifyAdmin } = require("../middlewares/authorization.middleware");

const router = express.Router();

// Product routes without :id param to get, create and toggle featured status
router
  .route("/")
  .get(asyncHandler(handleGetProducts))
  .patch(authMiddleware, verifyAdmin, asyncHandler(handleToggleFeatured))
  .post(
    authMiddleware,
    verifyAdmin,
    handleNewImages,
    asyncHandler(handleCreateProduct),
  );

router.get("/search", asyncHandler(handleProductSearch));

// Product routes with :id param to get and update product by id
router
  .route("/:id")
  .get(asyncHandler(handleGetProductDataById))
  .patch(
    authMiddleware,
    verifyAdmin,
    handleUpdatedImages,
    asyncHandler(handleUpdateProduct),
  );

module.exports = router;

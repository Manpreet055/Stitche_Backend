const express = require("express");
const {
  handleNewImages,
  handleUpdatedImages,
} = require("../middlewares/multerUploads");

const {
  handleToggleFeatured,
  handleUpdateProduct,
  handleCreateProduct,
} = require("../controllers/productsController");

const router = express.Router();

router.patch("/edit/:id", handleUpdatedImages, handleUpdateProduct);
router
  .route("/")
  .patch(handleToggleFeatured)
  .post(handleNewImages, handleCreateProduct);

module.exports = router;

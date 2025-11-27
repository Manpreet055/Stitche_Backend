const express = require("express");
const uploadMiddleWare = require("../middlewares/multerUploads");
const {
  handleToggleFeatured,
  handleEditProduct,
  handleCreateProduct,
} = require("../controllers/productsController");

const router = express.Router();

router.patch("/", handleToggleFeatured);

router.post("/", uploadMiddleWare, handleCreateProduct);

router.patch("/edit", handleEditProduct);
module.exports = router;

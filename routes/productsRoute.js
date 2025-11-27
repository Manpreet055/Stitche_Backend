const express = require("express");
const upload = require("../utils/multerUploads");
const {
  handleToggleFeatured,
  handleEditProduct,
  handleCreateProduct,
} = require("../controllers/productsController");

const router = express.Router();

router.patch("/", handleToggleFeatured);

router.post("/", handleCreateProduct);

router.patch("/edit", handleEditProduct);
module.exports = router;

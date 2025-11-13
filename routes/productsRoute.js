const express = require("express");
const {
  handleToggleFeatured,
  handleEditProduct,
} = require("../controllers/productsController");

const router = express.Router();

router.patch("/", handleToggleFeatured);
router.patch("/edit", handleEditProduct);
module.exports = router;

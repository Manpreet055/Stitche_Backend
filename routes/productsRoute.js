const express = require("express");
const {
  handleToggleFeatured,
  handleEditProduct,
  handleCreateProduct,
} = require("../controllers/productsController");

const router = express.Router();

router.route("/").patch(handleToggleFeatured).post(handleCreateProduct);
router.patch("/edit", handleEditProduct);
module.exports = router;

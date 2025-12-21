const express = require("express");
const {
  handleGetAllData,
  handleGetDataById,
  handleDeleteDataById,
  handleSearch,
  handleGetstats,
} = require("../controllers/core.controller");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

router.get("/search", asyncHandler(handleSearch));
router.get("/stats", asyncHandler(handleGetstats));

router.get("/:schema", asyncHandler(handleGetAllData));

router
  .route("/:schema/:id")
  .get(asyncHandler(handleGetDataById))
  .delete(asyncHandler(handleDeleteDataById));

module.exports = router;

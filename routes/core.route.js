const express = require("express");
const {
  handleGetAllData,
  handleGetDataById,
  handleDeleteDataById,
  handleSearch,
  handleGetstats,
} = require("../controllers/core.controller");
const asyncHandler = require("../utils/asyncHandler");
const { authMiddleware } = require("../middlewares/authentication.middleware");
const { verifyAdmin } = require("../middlewares/authorization.middleware");

const router = express.Router();

router.get("/search", authMiddleware, verifyAdmin, asyncHandler(handleSearch));
router.get("/stats", authMiddleware, verifyAdmin, asyncHandler(handleGetstats));

router.get(
  "/:schema",
  authMiddleware,
  verifyAdmin,
  asyncHandler(handleGetAllData),
);

router
  .route("/:schema/:id")
  .get(authMiddleware, verifyAdmin, asyncHandler(handleGetDataById))
  .delete(authMiddleware, verifyAdmin, asyncHandler(handleDeleteDataById));

module.exports = router;

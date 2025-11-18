const express = require("express");
const {
  handleGetAllData,
  handleGetDataById,
  handleDeleteDataById,
  handleSearch,
  handleGetstats,
} = require("../controllers/coreControllers");

const router = express.Router();

router.get("/search", handleSearch);
router.get("/stats", handleGetstats);

router.get("/:schema", handleGetAllData);

router
  .route("/:schema/:id")
  .get(handleGetDataById)
  .delete(handleDeleteDataById);

module.exports = router;

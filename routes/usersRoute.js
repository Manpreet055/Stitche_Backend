const express = require("express");
const {
  getUsers,
  filterUsers,
  handleFindUserById,
} = require("../controllers/usersControllers");

const router = express.Router();

router.get("/", getUsers);
router.get("/filter", filterUsers);
router.get("/:id", handleFindUserById);

module.exports = router;

const express = require("express");
const {
  getUsers,
  handleFindUserById,
} = require("../controllers/usersControllers");

const router = express.Router();

router.get("/", getUsers);
router.get("/:id", handleFindUserById);

module.exports = router;

const express = require("express");
const { getUsers,handleSearchUsers } = require("../controllers/usersControllers");

const router = express.Router();

router.get("/", getUsers);
router.get("/search", handleSearchUsers);

module.exports = router;
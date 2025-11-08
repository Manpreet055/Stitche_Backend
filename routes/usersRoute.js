const express = require("express");
const { getUsers, filterUsers } = require("../controllers/usersControllers");

const router = express.Router();

router.get("/", getUsers);
router.get("/filter", filterUsers);

module.exports = router;

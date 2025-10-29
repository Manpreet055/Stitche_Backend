const express =  require("express");
const {handleGetAllOrders} = require("../controllers/orders")

const router = express.Router()

router.get("/",handleGetAllOrders)

module.exports = router 
const express =  require("express");
const {handleGetAllOrders} = require("../controllers/ordersControllers")

const router = express.Router()

router.get("/",handleGetAllOrders)

module.exports = router 
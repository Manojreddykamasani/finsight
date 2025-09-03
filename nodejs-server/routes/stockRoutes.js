const express = require("express");
const stockController = require("../controllers/stockController");

const router = express.Router();

router.get("/", stockController.getAllStocks);
router.get("/:symbol", stockController.getStockBySymbol);

module.exports = router;

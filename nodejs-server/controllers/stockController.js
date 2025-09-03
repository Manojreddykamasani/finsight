const Stock = require("../models/stockModel");

exports.getAllStocks = async (req, res) => {
  try {
    const stocks = await Stock.find(
      {},
      "symbol name sector price logoUrl"
    );
    res.status(200).json({ status: "success", data: stocks });
  } catch (err) {
    res.status(500).json({ status: "fail", message: err.message });
  }
};

exports.getStockBySymbol = async (req, res) => {
  try {
    const stock = await Stock.findOne({ symbol: req.params.symbol.toUpperCase() });
    if (!stock) {
      return res.status(404).json({ status: "fail", message: "Stock not found" });
    }
    res.status(200).json({ status: "success", data: stock });
  } catch (err) {
    res.status(500).json({ status: "fail", message: err.message });
  }
};

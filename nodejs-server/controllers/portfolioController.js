const User = require("../models/userModel");
const Stock = require("../models/stockModel");
const Transaction = require("../models/transactionModel");
const { marketPressure } = require("../sockets/stockSocket"); // We will export this from the socket file

// GET /api/portfolio
exports.getPortfolio = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate({
            path: 'portfolio.stock',
            select: 'symbol name price logoUrl' // Populate with essential stock details
        });

        if (!user) {
            return res.status(404).json({ status: "fail", message: "User not found" });
        }

        res.status(200).json({
            status: "success",
            data: {
                balance: user.balance,
                portfolio: user.portfolio
            }
        });
    } catch (err) {
        res.status(500).json({ status: "fail", message: err.message });
    }
};

// POST /api/portfolio/buy
exports.buyStock = async (req, res) => {
    const { symbol, quantity } = req.body;
    const userId = req.user.id;

    if (!symbol || !quantity || quantity <= 0) {
        return res.status(400).json({ status: "fail", message: "A valid symbol and positive quantity are required." });
    }

    try {
        const stock = await Stock.findOne({ symbol: symbol.toUpperCase() });
        const user = await User.findById(userId);

        if (!stock) return res.status(404).json({ message: "Stock not found." });
        if (!user) return res.status(404).json({ message: "User not found." });

        const cost = stock.price * quantity;
        if (user.balance < cost) {
            return res.status(400).json({ message: "Insufficient funds." });
        }

        const existingStockIndex = user.portfolio.findIndex(s => s.stock.equals(stock._id));

        if (existingStockIndex > -1) {
            const existingStock = user.portfolio[existingStockIndex];
            const totalQuantity = existingStock.quantity + quantity;
            const newAveragePrice = ((existingStock.averageBuyPrice * existingStock.quantity) + cost) / totalQuantity;
            
            existingStock.quantity = totalQuantity;
            existingStock.averageBuyPrice = newAveragePrice;
        } else {
            user.portfolio.push({
                stock: stock._id,
                quantity: quantity,
                averageBuyPrice: stock.price
            });
        }
        
        user.balance -= cost;
        await user.save();
        await Transaction.create({ user: userId, stock: stock._id, type: 'buy', quantity, price: stock.price });
        
        // Update market pressure to influence simulation
        marketPressure[stock.symbol] = (marketPressure[stock.symbol] || 0) + quantity;

        res.status(200).json({ status: "success", message: `Successfully bought ${quantity} shares of ${symbol}.` });
    } catch (err) {
        res.status(500).json({ status: "fail", message: err.message });
    }
};

// POST /api/portfolio/sell
exports.sellStock = async (req, res) => {
    const { symbol, quantity } = req.body;
    const userId = req.user.id;

    if (!symbol || !quantity || quantity <= 0) {
        return res.status(400).json({ status: "fail", message: "A valid symbol and positive quantity are required." });
    }

    try {
        const stock = await Stock.findOne({ symbol: symbol.toUpperCase() });
        const user = await User.findById(userId);

        if (!stock) return res.status(404).json({ message: "Stock not found." });
        if (!user) return res.status(404).json({ message: "User not found." });

        const stockInPortfolio = user.portfolio.find(s => s.stock.equals(stock._id));

        if (!stockInPortfolio || stockInPortfolio.quantity < quantity) {
            return res.status(400).json({ message: "You do not own enough shares to sell." });
        }

        const revenue = stock.price * quantity;
        stockInPortfolio.quantity -= quantity;
        
        if (stockInPortfolio.quantity === 0) {
            user.portfolio = user.portfolio.filter(s => !s.stock.equals(stock._id));
        }

        user.balance += revenue;
        await user.save();
        await Transaction.create({ user: userId, stock: stock._id, type: 'sell', quantity, price: stock.price });

        // Update market pressure to influence simulation
        marketPressure[stock.symbol] = (marketPressure[stock.symbol] || 0) - quantity;

        res.status(200).json({ status: "success", message: `Successfully sold ${quantity} shares of ${symbol}.` });
    } catch (err) {
        res.status(500).json({ status: "fail", message: err.message });
    }
};
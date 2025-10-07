const mongoose = require('mongoose');
const User = require("../models/userModel");
const Stock = require("../models/stockModel");
const Transaction = require("../models/transactionModel");
const { marketPressure } = require("../simulation/marketState");
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

exports.buyStock = async (req, res) => {
    const { symbol, quantity } = req.body;
    const userId = req.user.id;

    if (!symbol || !quantity || quantity <= 0) {
        return res.status(400).json({ status: "fail", message: "A valid symbol and positive quantity are required." });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const stock = await Stock.findOne({ symbol: symbol.toUpperCase() }).session(session);
        const user = await User.findById(userId).session(session);

        if (!stock) throw new Error("Stock not found.");
        if (!user) throw new Error("User not found.");

        const cost = stock.price * quantity;
        if (user.balance < cost) {
            throw new Error("Insufficient funds.");
        }

        const existingStockIndex = user.portfolio.findIndex(s => s.stock.equals(stock._id));

        if (existingStockIndex > -1) {
            const es = user.portfolio[existingStockIndex];
            const totalQty = es.quantity + Number(quantity);
            es.averageBuyPrice = ((es.averageBuyPrice * es.quantity) + cost) / totalQty;
            es.quantity = totalQty;
        } else {
            user.portfolio.push({ stock: stock._id, quantity: Number(quantity), averageBuyPrice: stock.price });
        }
        
        user.balance -= cost;
        
        await user.save({ session });
        await Transaction.create([{ user: userId, stock: stock._id, type: 'buy', quantity, price: stock.price }], { session });
        
        await session.commitTransaction();

        marketPressure[stock.symbol] = (marketPressure[stock.symbol] || 0) + Number(quantity);
        
        res.status(200).json({ status: "success", message: `Successfully bought ${quantity} shares of ${symbol}.` });

    } catch (err) {
        await session.abortTransaction();
        res.status(400).json({ status: "fail", message: err.message || "Transaction failed." });
    } finally {
        session.endSession();
    }
};

exports.getTransactionsBySymbol = async (req, res) => {
    try {
        const { symbol } = req.params;
        // First find the stock to get its _id
        const stock = await Stock.findOne({ symbol: symbol.toUpperCase() });

        if (!stock) {
            return res.status(404).json({ status: "fail", message: "Stock not found" });
        }

        // Then find transactions for that user and stock
        const transactions = await Transaction.find({
            user: req.user.id,
            stock: stock._id
        })
        .sort({ timestamp: -1 }) // Most recent first
        .limit(20); // Get the last 20 trades

        res.status(200).json({ status: "success", data: transactions });

    } catch (err) {
        res.status(500).json({ status: "fail", message: err.message });
    }
};
exports.sellStock = async (req, res) => {
    const { symbol, quantity } = req.body;
    const userId = req.user.id;

    if (!symbol || !quantity || quantity <= 0) {
        return res.status(400).json({ status: "fail", message: "A valid symbol and positive quantity are required." });
    }
    
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const stock = await Stock.findOne({ symbol: symbol.toUpperCase() }).session(session);
        const user = await User.findById(userId).session(session);

        if (!stock) throw new Error("Stock not found.");
        if (!user) throw new Error("User not found.");

        const stockInPortfolio = user.portfolio.find(s => s.stock.equals(stock._id));
        if (!stockInPortfolio || stockInPortfolio.quantity < quantity) {
            throw new Error("You do not own enough shares to sell.");
        }

        const revenue = stock.price * quantity;
        stockInPortfolio.quantity -= quantity;
        
        if (stockInPortfolio.quantity === 0) {
            user.portfolio = user.portfolio.filter(s => !s.stock.equals(stock._id));
        }

        user.balance += revenue;
        
        await user.save({ session });
        await Transaction.create([{ user: userId, stock: stock._id, type: 'sell', quantity, price: stock.price }], { session });

        await session.commitTransaction();
        
        marketPressure[stock.symbol] = (marketPressure[stock.symbol] || 0) - Number(quantity);

        res.status(200).json({ status: "success", message: `Successfully sold ${quantity} shares of ${symbol}.` });

    } catch (err) {
        await session.abortTransaction();
        res.status(400).json({ status: "fail", message: err.message || "Transaction failed." });
    } finally {
        session.endSession();
    }
};
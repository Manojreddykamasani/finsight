const mongoose = require('mongoose');
const Agent = require('../models/agentModel');
const Stock = require('../models/stockModel');
const Transaction = require('../models/transactionModel');
const Loan = require('../models/loanModel');
const AgentLog = require('../models/agentLogModel');
const { marketPressure } = require('../simulation/marketState');

// --- NEW: Agent Management (for Admin Panel) ---

exports.createAgent = async (req, res) => {
    try {
        const { name, persona } = req.body;
        if (!name || !persona) {
            return res.status(400).json({ status: "fail", message: "Name and persona are required." });
        }
        const newAgent = await Agent.create({ name, persona });
        res.status(201).json({ status: "success", message: "Agent created successfully.", data: newAgent });
    } catch (err) {
        // Handle potential duplicate name error
        if (err.code === 11000) {
            return res.status(409).json({ status: "fail", message: "An agent with this name already exists." });
        }
        res.status(500).json({ status: "fail", message: err.message });
    }
};

exports.getAllAgents = async (req, res) => {
    try {
        const agents = await Agent.find({}, '_id name persona'); // Send back only essential info
        res.status(200).json({ status: "success", data: agents });
    } catch (err) {
        res.status(500).json({ status: "fail", message: err.message });
    }
};


// --- Existing Agent Portfolio and Trading ---

exports.buyStock = async (req, res) => {
    const { agentId, symbol, quantity } = req.body;
    if (!agentId || !symbol || !quantity || quantity <= 0) {
        return res.status(400).json({ status: "fail", message: "agentId, a valid symbol, and positive quantity are required." });
    }

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const stock = await Stock.findOne({ symbol: symbol.toUpperCase() }).session(session);
        const agent = await Agent.findById(agentId).session(session);

        if (!stock) throw new Error("Stock not found.");
        if (!agent) throw new Error("AI Agent not found.");

        const cost = stock.price * quantity;
        if (agent.balance < cost) throw new Error("Agent has insufficient funds.");

        const existingStockIndex = agent.portfolio.findIndex(s => s.stock.equals(stock._id));
        if (existingStockIndex > -1) {
            const es = agent.portfolio[existingStock-index];
            const totalQty = es.quantity + Number(quantity);
            es.averageBuyPrice = ((es.averageBuyPrice * es.quantity) + cost) / totalQty;
            es.quantity = totalQty;
        } else {
            agent.portfolio.push({ stock: stock._id, quantity: Number(quantity), averageBuyPrice: stock.price });
        }
        
        agent.balance -= cost;
        await agent.save({ session });
        // NOTE: You may want to create a separate collection for Agent transactions later
        // For now, this adds a reference to the agent in the user transaction schema
        await Transaction.create([{ agent: agentId, user: null, stock: stock._id, type: 'buy', quantity, price: stock.price }], { session });
        
        await session.commitTransaction();
        
        marketPressure[stock.symbol] = (marketPressure[stock.symbol] || 0) + Number(quantity);
        
        res.status(200).json({ status: "success", message: `Agent ${agent.name} bought ${quantity} shares of ${symbol}.`, data: agent });
    } catch (err) {
        await session.abortTransaction();
        res.status(400).json({ status: "fail", message: err.message || "Agent transaction failed." });
    } finally {
        session.endSession();
    }
};

exports.sellStock = async (req, res) => {
    const { agentId, symbol, quantity } = req.body;
    if (!agentId || !symbol || !quantity || quantity <= 0) {
        return res.status(400).json({ status: "fail", message: "agentId, a valid symbol, and positive quantity are required." });
    }
    
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const stock = await Stock.findOne({ symbol: symbol.toUpperCase() }).session(session);
        const agent = await Agent.findById(agentId).session(session);

        if (!stock) throw new Error("Stock not found.");
        if (!agent) throw new Error("AI Agent not found.");

        const stockInPortfolio = agent.portfolio.find(s => s.stock.equals(stock._id));
        if (!stockInPortfolio || stockInPortfolio.quantity < quantity) {
            throw new Error("Agent does not own enough shares to sell.");
        }

        const revenue = stock.price * quantity;
        stockInPortfolio.quantity -= quantity;
        
        if (stockInPortfolio.quantity === 0) {
            agent.portfolio = agent.portfolio.filter(s => !s.stock.equals(stock._id));
        }

        agent.balance += revenue;
        await agent.save({ session });
        await Transaction.create([{ agent: agentId, user: null, stock: stock._id, type: 'sell', quantity, price: stock.price }], { session });

        await session.commitTransaction();
        
        marketPressure[stock.symbol] = (marketPressure[stock.symbol] || 0) - Number(quantity);
        
        res.status(200).json({ status: "success", message: `Agent ${agent.name} sold ${quantity} shares of ${symbol}.`, data: agent });
    } catch (err) {
        await session.abortTransaction();
        res.status(400).json({ status: "fail", message: err.message || "Agent transaction failed." });
    } finally {
        session.endSession();
    }
};

// --- Agent Loan System ---

exports.takeLoan = async (req, res) => {
    const { agentId, amount } = req.body;
    if (!agentId || !amount || amount <= 0) {
        return res.status(400).json({ status: "fail", message: "agentId and a positive loan amount are required." });
    }

    try {
        const agent = await Agent.findById(agentId);
        if (!agent) throw new Error("AI Agent not found.");

        let interestRate;
        if (amount < 10000) interestRate = 0.08;
        else if (amount < 50000) interestRate = 0.06;
        else interestRate = 0.04;

        const repaymentAmount = amount * (1 + interestRate);

        await Loan.create({ agent: agentId, amount, interestRate, repaymentAmount });
        
        agent.balance += Number(amount);
        await agent.save();

        res.status(201).json({ status: "success", message: `Loan of ${amount} approved for Agent ${agent.name} at ${interestRate*100}% interest.` });

    } catch (err) {
        res.status(400).json({ status: "fail", message: err.message || "Loan application failed." });
    }
};

// --- Agent Daily Logging ---

exports.createDailyLog = async (req, res) => {
    const { agentId, insight, actionsTaken, marketSentiment, netWorthSnapshot } = req.body;
    try {
        const log = await AgentLog.create({ agent: agentId, insight, actionsTaken, marketSentiment, netWorthSnapshot });
        res.status(201).json({ status: "success", data: log });
    } catch (err) {
        res.status(400).json({ status: "fail", message: err.message });
    }
};

// --- Helper routes to get agent data ---
exports.getAgentDetails = async (req, res) => {
    try {
        const agent = await Agent.findById(req.params.id).populate('portfolio.stock', 'symbol name price');
        const loans = await Loan.find({ agent: req.params.id, status: 'ACTIVE' });
        if (!agent) return res.status(404).json({ status: "fail", message: "Agent not found" });

        res.status(200).json({ status: "success", data: { agent, loans } });
    } catch (err) {
        res.status(500).json({ status: "fail", message: err.message });
    }
};
exports.deleteAgent = async (req, res) => {
    try {
        const agent = await Agent.findByIdAndDelete(req.params.id);

        if (!agent) {
            return res.status(404).json({ status: "fail", message: "Agent not found" });
        }

        // Optional: Also delete related logs and loans if necessary
        await AgentLog.deleteMany({ agent: req.params.id });
        await Loan.deleteMany({ agent: req.params.id });

        res.status(204).json({ status: "success", data: null }); // 204 No Content is standard for successful deletes

    } catch (err) {
        res.status(500).json({ status: "fail", message: err.message });
    }
};


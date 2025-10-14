const mongoose = require('mongoose');

// We can reuse the same sub-document schema from the user model for consistency
const portfolioStockSchema = new mongoose.Schema({
    stock: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Stock',
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: [0, 'Quantity cannot be negative']
    },
    averageBuyPrice: {
        type: Number,
        required: true
    }
}, { 
    _id: false 
});

const agentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Agent must have a name'],
        unique: true,
        trim: true,
    },
    persona: {
        type: String,
        required: [true, 'Agent must have a persona (e.g., Aggressive, Value Investor)'],
        trim: true,
    },
    balance: {
        type: Number,
        default: 100000 // Agents also start with $100,000
    },
    portfolio: [portfolioStockSchema],
}, {
    timestamps: true,
});

const Agent = mongoose.model('Agent', agentSchema);
module.exports = Agent;

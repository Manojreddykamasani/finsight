const mongoose = require('mongoose');

const agentLogSchema = new mongoose.Schema({
    agent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Agent',
        required: true
    },
    // The message/log content provided by the external trigger (FastAPI server)
    insight: {
        type: String,
        required: [true, "Log entry must contain insights."]
    },
    actionsTaken: {
        type: String,
        required: [true, "Log must specify actions taken."]
    },
    marketSentiment: {
        type: String, // e.g., "Bullish", "Bearish", "Neutral"
        required: true,
    },
    // A snapshot of the agent's net worth at the time of logging
    netWorthSnapshot: {
        type: Number,
        required: true,
    }
}, {
    timestamps: true // createdAt will serve as the log date
});

const AgentLog = mongoose.model('AgentLog', agentLogSchema);
module.exports = AgentLog;

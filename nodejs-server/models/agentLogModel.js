const mongoose = require('mongoose');

const agentLogSchema = new mongoose.Schema({
    agent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Agent',
        required: true
    },

    newsEvent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'NewsEvent',
        index: true, 
        default: null
    },
    insight: {
        type: String,
        required: [true, "Log entry must contain insights."]
    },
    actionsTaken: {
        type: String,
        required: [true, "Log must specify actions taken."]
    },
    marketSentiment: {
        type: String, 
        required: true,
    },
    netWorthSnapshot: {
        type: Number,
        required: true,
    }
}, {
    timestamps: true 
});

const AgentLog = mongoose.model('AgentLog', agentLogSchema);
module.exports = AgentLog;
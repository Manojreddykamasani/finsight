const User = require('../models/userModel');
const Agent = require('../models/agentModel');
const AgentLog = require('../models/agentLogModel');
const NewsEvent = require('../models/newsEventModel'); 
const calculatePortfolioValue = (portfolio) => {
    if (!portfolio || portfolio.length === 0) {
        return 0;
    }
    return portfolio.reduce((total, item) => {
        const price = item.stock && item.stock.price ? item.stock.price : 0;
        return total + (item.quantity * price);
    }, 0);
};


exports.getLeaderboard = async (req, res) => {
    try {
        const users = await User.find({}).populate('portfolio.stock');
        const agents = await Agent.find({}).populate('portfolio.stock');

        const userLeaderboard = users.map(user => {
            const portfolioValue = calculatePortfolioValue(user.portfolio);
            const netWorth = user.balance + portfolioValue;
            return { type: 'User', name: user.email, netWorth: parseFloat(netWorth.toFixed(2)) };
        });

        const agentLeaderboard = agents.map(agent => {
            const portfolioValue = calculatePortfolioValue(agent.portfolio);
            const netWorth = agent.balance + portfolioValue;
            return { type: 'Agent', name: agent.name, persona: agent.persona, netWorth: parseFloat(netWorth.toFixed(2)) };
        });

        const combined = [...userLeaderboard, ...agentLeaderboard];
        combined.sort((a, b) => b.netWorth - a.netWorth);

        res.status(200).json({ status: 'success', data: combined });
    } catch (err) {
        res.status(500).json({ status: 'fail', message: `Error fetching leaderboard: ${err.message}` });
    }
};


exports.getAgentLeaderboard = async (req, res) => {
    try {
        const agents = await Agent.find({}).populate('portfolio.stock');
        
        const leaderboard = agents.map(agent => {
            const portfolioValue = calculatePortfolioValue(agent.portfolio);
            const netWorth = agent.balance + portfolioValue;
            return {
                _id: agent._id,
                type: 'Agent',
                name: agent.name,
                persona: agent.persona,
                netWorth: parseFloat(netWorth.toFixed(2))
            };
        });
        
        leaderboard.sort((a, b) => b.netWorth - a.netWorth);

        res.status(200).json({ status: 'success', data: leaderboard });
    } catch (err) {
        res.status(500).json({ status: 'fail', message: `Error fetching agent leaderboard: ${err.message}` });
    }
};


exports.getSingleAgentAnalytics = async (req, res) => {
    try {
        const { id } = req.params;

        const agent = await Agent.findById(id).populate('portfolio.stock').lean();
        if (!agent) {
            return res.status(404).json({ status: 'fail', message: 'Agent not found' });
        }
        
        const logs = await AgentLog.find({ agent: id }).sort({ createdAt: -1 }).lean();

        const portfolioValue = calculatePortfolioValue(agent.portfolio);
        const netWorth = agent.balance + portfolioValue;

        const analyticsData = {
            agentDetails: {
                ...agent,
                portfolioValue: parseFloat(portfolioValue.toFixed(2)),
                netWorth: parseFloat(netWorth.toFixed(2)),
            },
            logs: logs
        };
        delete analyticsData.agentDetails.portfolio;


        res.status(200).json({ status: 'success', data: analyticsData });

    } catch (err) {
        res.status(500).json({ status: 'fail', message: `Error fetching single agent analytics: ${err.message}` });
    }
};
exports.getNewsWithReactions = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const newsEvents = await NewsEvent.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(); 

        const totalEvents = await NewsEvent.countDocuments();

        const eventsWithReactions = await Promise.all(
            newsEvents.map(async (event) => {
                const reactions = await AgentLog.find({ newsEvent: event._id })
                    .populate('agent', 'name') 
                    .select('agent insight actionsTaken marketSentiment createdAt') 
                    .sort({ createdAt: 1 }) 
                    .lean();
                
                return {
                    ...event,
                    reactions: reactions,
                };
            })
        );

        res.status(200).json({
            status: 'success',
            data: eventsWithReactions,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalEvents / limit),
                totalEvents: totalEvents,
                limit: limit
            }
        });

    } catch (err) {
        res.status(500).json({ status: 'fail', message: `Error fetching news with reactions: ${err.message}` });
    }
};

const express = require('express');
const router = express.Router();
const { 
    getLeaderboard, 
    getAgentLeaderboard, 
    getSingleAgentAnalytics ,
    getNewsWithReactions
} = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

// The full leaderboard can be viewed by authenticated users
router.get('/leaderboard', protect, getLeaderboard);

// --- NEW ROUTES ---

// A public route for just the agent leaderboard (for service-to-service calls)
// This allows the FastAPI server to get the data without needing a user login.
router.get('/leaderboard/agents', getAgentLeaderboard);

// A public route to get detailed analytics for a single agent by their ID
router.get('/agents/:id/analytics', getSingleAgentAnalytics);
router.get('/news/reactions', getNewsWithReactions);
module.exports = router;
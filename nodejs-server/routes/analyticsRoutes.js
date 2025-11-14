const express = require('express');
const router = express.Router();
const { 
    getLeaderboard, 
    getAgentLeaderboard, 
    getSingleAgentAnalytics ,
    getNewsWithReactions
} = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

router.get('/leaderboard', protect, getLeaderboard);

router.get('/leaderboard/agents', getAgentLeaderboard);

router.get('/agents/:id/analytics', getSingleAgentAnalytics);
router.get('/news/reactions', getNewsWithReactions);
module.exports = router;
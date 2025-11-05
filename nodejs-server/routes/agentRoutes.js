const express = require('express');
const router = express.Router();
const { 
    createAgent,         // NEW
    getAllAgents,        // NEW
    getAgentDetails,
    buyStock, 
    sellStock, 
    takeLoan,
    createDailyLog,
    deleteAgent
} = require('../controllers/agentController');

// --- Agent Management (for the admin panel/FastAPI service) ---
// Corresponds to POST /api/agents/
router.post('/', createAgent);
router.delete('/:id', deleteAgent);
// Corresponds to GET /api/agents/
router.get('/', getAllAgents);


// --- Specific Agent Details & Actions ---

// Get a specific agent's portfolio, balance, and loans
// Corresponds to GET /api/agents/:id
router.get('/:id', getAgentDetails);

// Trading actions
router.post('/buy', buyStock);
router.post('/sell', sellStock);

// Financial actions
router.post('/loan', takeLoan);

// Logging actions
router.post('/log', createDailyLog);

module.exports = router;


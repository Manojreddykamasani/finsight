const express = require('express');
const router = express.Router();
const { 
    createAgent,        
    getAllAgents,        
    getAgentDetails,
    buyStock, 
    sellStock, 
    takeLoan,
    createDailyLog,
    deleteAgent
} = require('../controllers/agentController');


router.post('/', createAgent);
router.delete('/:id', deleteAgent);
router.get('/', getAllAgents);


router.get('/:id', getAgentDetails);

router.post('/buy', buyStock);
router.post('/sell', sellStock);

router.post('/loan', takeLoan);

router.post('/log', createDailyLog);

module.exports = router;


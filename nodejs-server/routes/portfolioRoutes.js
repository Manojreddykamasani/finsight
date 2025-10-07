const express = require('express');
const router = express.Router();
const { buyStock, sellStock, getPortfolio,getTransactionsBySymbol} = require('../controllers/portfolioController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getPortfolio);
router.post('/buy', buyStock);
router.post('/sell', sellStock);
router.get('/transactions/:symbol', getTransactionsBySymbol);
module.exports = router;
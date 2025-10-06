const express = require('express');
const router = express.Router();
const { buyStock, sellStock, getPortfolio } = require('../controllers/portfolioController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getPortfolio);
router.post('/buy', buyStock);
router.post('/sell', sellStock);

module.exports = router;
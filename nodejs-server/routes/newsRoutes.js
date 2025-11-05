const express = require('express');
const router = express.Router();
const { createNewsEvent } = require('../controllers/newsController');

// This route is for your Python service to call
// POST /api/news
router.post('/', createNewsEvent);

module.exports = router;
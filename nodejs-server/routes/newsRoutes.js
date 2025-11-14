const express = require('express');
const router = express.Router();
const { createNewsEvent } = require('../controllers/newsController');

router.post('/', createNewsEvent);

module.exports = router;
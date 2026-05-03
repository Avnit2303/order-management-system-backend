const express = require('express');
const router = express.Router();
const { getAllPrices } = require('../controllers/pricesController');

// GET /api/prices — public
router.get('/', getAllPrices);

module.exports = router;

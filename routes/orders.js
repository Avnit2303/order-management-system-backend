const express = require('express');
const router = express.Router();
const { submitOrder } = require('../controllers/ordersController');

// POST /api/submit — public
router.post('/', submitOrder);

module.exports = router;

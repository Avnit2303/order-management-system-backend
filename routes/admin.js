const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { login } = require('../controllers/adminController');
const { getAllOrders, downloadExcel } = require('../controllers/ordersController');
const { createPrice, updatePrice, deletePrice } = require('../controllers/pricesController');

// Public
router.post('/login', login);

// Protected — all routes below require JWT
router.use(authMiddleware);

router.get('/orders', getAllOrders);
router.get('/download', downloadExcel);

router.post('/prices', createPrice);
router.put('/prices/:id', updatePrice);
router.delete('/prices/:id', deletePrice);

module.exports = router;

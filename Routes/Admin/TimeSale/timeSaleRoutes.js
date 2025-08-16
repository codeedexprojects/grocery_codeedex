const express = require('express');
const router = express.Router();
const { addTimeSale, getTimeSales, deleteTimeSale, searchTimeSales } = require('../../../Controller/Admin/TimeSale/timeSaleController');

// Admin: Add Time Sale Product
router.post('/create', addTimeSale);

// Public: Get Time Sale Products
router.get('/get', getTimeSales);

// Admin: Delete Time Sale Product
router.delete('/delete/:id', deleteTimeSale);

// Seach
router.get('/search', searchTimeSales);


module.exports = router;

const express = require('express');
const router = express.Router();
const { addTimeSale, getTimeSales, deleteTimeSale, searchTimeSales } = require('../../../Controller/Admin/TimeSale/timeSaleController');
const { upload } = require('../../../Middlewares/multerMiddleware');
const cloudinaryMapper = require('../../../Middlewares/cloudinaryMapper')


// Admin: Add Time Sale Product
router.post('/create', upload.single('image'), cloudinaryMapper, addTimeSale);


// Public: Get Time Sale Products
router.get('/get', getTimeSales);

// Admin: Delete Time Sale Product
router.delete('/delete/:id', deleteTimeSale);

// Seach
router.get('/search', searchTimeSales);


module.exports = router;

const express = require('express');
const router = express.Router();
const { getTimeSales} = require('../../../Controller/User/TimeSale/timeSaleController');

router.get('/get', getTimeSales);

module.exports = router;
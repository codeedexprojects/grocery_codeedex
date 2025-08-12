const express = require('express');
const router = express.Router();
const { updateCoinSettings, getCoinSettings } = require('../../../Controller/Admin/CoinSettings/coinController');


router.get('/', getCoinSettings);
router.post('/', updateCoinSettings);

module.exports = router;

const express = require('express');
const router = express.Router();
const carouselController = require('../../../Controller/User/Carousal/homeGifController');


router.get('/get', carouselController.getAllCarousels);

module.exports = router;

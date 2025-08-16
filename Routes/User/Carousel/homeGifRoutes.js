const express = require('express');
const router = express.Router();
const carouselController = require('../../../Controller/User/Carousel/homeGifController');

router.get('/get', carouselController.getCarousel);

module.exports = router;

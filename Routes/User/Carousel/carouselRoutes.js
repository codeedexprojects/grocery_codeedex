const express = require('express');
const router = express.Router();
const carouselController = require('../../../Controller/User/Carousel/carouselController');


router.get('/get', carouselController.getCarousels);


module.exports = router;

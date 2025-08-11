const express = require('express');
const router = express.Router();
const carouselController = require('../../../Controller/Admin/Carousal/carousalController');
const {upload} = require('../../../Middlewares/multerMiddleware');


router.post('/create', upload.single('image'), carouselController.createCarousel);

router.get('/get', carouselController.getCarousels);

router.delete('/delete/:id', carouselController.deleteCarousel);

module.exports = router;

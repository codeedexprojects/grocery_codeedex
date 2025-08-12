const express = require('express');
const router = express.Router();
const carouselController = require('../../../Controller/Admin/Carousel/homeGifController');
const { upload } = require('../../../Middlewares/multerMiddleware');

router.post(
  '/create',
  upload.fields([
    { name: 'backgroundImage', maxCount: 1 },
    { name: 'gifs', maxCount: 10 }
  ]),
  carouselController.createCarousel
);

router.get('/get', carouselController.getAllCarousels);

router.patch(
  '/update/:id',
  upload.fields([
    { name: 'backgroundImage', maxCount: 1 },
    { name: 'gifs', maxCount: 10 }
  ]),
  carouselController.updateCarousel
);

router.delete('/delete/:id', carouselController.deleteCarousel);

module.exports = router;

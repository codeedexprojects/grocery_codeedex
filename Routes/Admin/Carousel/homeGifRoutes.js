const express = require('express');
const router = express.Router();
const carouselController = require('../../../Controller/Admin/Carousel/homeGifController');
const { upload } = require('../../../Middlewares/multerMiddleware');
const cloudinaryMapper = require('../../../Middlewares/cloudinaryMapper')


router.post(
  '/create',
  upload.fields([
    { name: 'backgroundImage', maxCount: 1 },
    { name: 'gif', maxCount: 1 }
  ]),
  cloudinaryMapper,
  carouselController.createCarousel
);

router.get('/get', carouselController.getCarousel);

router.patch(
  '/update/:id',
  upload.fields([
    { name: 'backgroundImage', maxCount: 1 },
    { name: 'gif', maxCount: 1 }
  ]),
  cloudinaryMapper,
  carouselController.updateCarousel
);

router.delete('/delete/:id', carouselController.deleteCarousel);

module.exports = router;

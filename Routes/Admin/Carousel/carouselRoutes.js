const express = require('express');
const router = express.Router();
const carouselController = require('../../../Controller/Admin/Carousel/carouselController');
const { upload } = require('../../../Middlewares/multerMiddleware');
const cloudinaryMapper = require('../../../Middlewares/cloudineryMaper')

// Accept both images
router.post(
  '/create',
  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'secondaryImage', maxCount: 1 }
  ]),
  carouselController.createCarousel
);

router.get('/get', carouselController.getCarousels);

router.delete('/delete/:id', carouselController.deleteCarousel);

module.exports = router;

const express = require('express');
const router = express.Router();
const gifController = require('../../../Controller/Admin/Carousal/homeGifController');
const upload = require('../../../Middlewares/multerMiddleware');

router.post('/upload', upload.single('gif'), gifController.uploadGif);
router.get('/', gifController.getAllGifs);

module.exports = router;

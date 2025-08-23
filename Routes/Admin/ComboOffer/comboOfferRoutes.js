const express = require('express');
const router = express.Router();
const comboOfferController = require('../../../Controller/Admin/ComboOffer/comboOfferController');
const { upload } = require('../../../Middlewares/multerMiddleware');


router.post('/create',upload.single('image'), comboOfferController.createComboOffer);
router.get('/get',  comboOfferController.getAllComboOffers);
router.get('/get/:id', comboOfferController.getComboOfferById);
router.patch('/update/:id', upload.single('image'),comboOfferController.updateComboOffer);
router.delete('/delete/:id', comboOfferController.deleteComboOffer);
router.get('/search', comboOfferController.searchComboOffers)

module.exports = router;
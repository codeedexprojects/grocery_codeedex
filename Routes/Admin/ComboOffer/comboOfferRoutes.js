const express = require('express');
const router = express.Router();
const comboOfferController = require('../../../Controller/Admin/ComboOffer/comboOfferController');

router.post('/create', comboOfferController.createComboOffer);
router.get('/get',  comboOfferController.getAllComboOffers);
router.get('/get/:id', comboOfferController.getComboOfferById);
router.patch('/update/:id', comboOfferController.updateComboOffer);
router.delete('/delete/:id', comboOfferController.deleteComboOffer);
router.get('/search', comboOfferController.searchComboOffers)

module.exports = router;
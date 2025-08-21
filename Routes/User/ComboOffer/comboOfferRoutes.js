const express = require('express');
const router = express.Router();
const comboOfferController = require('../../../Controller/User/ComboOffer/comboOfferController');

router.get('/get',  comboOfferController.getAllComboOffers);
router.get('/get/:id', comboOfferController.getComboOfferById);
router.get('/search', comboOfferController.searchComboOffers)
router.get('/list', comboOfferController.getCombosByCategory);

module.exports = router;
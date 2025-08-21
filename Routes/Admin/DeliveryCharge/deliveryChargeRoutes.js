const express = require('express');
const router = express.Router();
const {
  addDeliveryCharge,
  getDeliveryCharges,
  updateDeliveryCharge,
  deleteDeliveryCharge,
  getChargeByAmount
} = require('../../../Controller/Admin/DeliveryCharge/deliveryChargeController');

router.post('/create', addDeliveryCharge);
router.get('/get', getDeliveryCharges);
router.put('/update/:id', updateDeliveryCharge);
router.delete('/delete/:id', deleteDeliveryCharge);

router.get('/check', getChargeByAmount);

module.exports = router;

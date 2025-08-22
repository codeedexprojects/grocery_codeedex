const express = require('express');
const router = express.Router();
const checkoutController = require('../../../Controller/User/Checkout/checkoutController');
const jwtVerify = require('../../../Middlewares/jwtMiddleware')

router.post('/create', jwtVerify(['user']), checkoutController.createCheckout);
router.get('/get', jwtVerify(['user']), checkoutController.getCheckout);
router.post('/apply-coins', jwtVerify(['user']), checkoutController.applyCoinsInCheckout);
router.post('/remove-coins',jwtVerify(['user']), checkoutController.removeCoinsFromCheckout);

module.exports = router;

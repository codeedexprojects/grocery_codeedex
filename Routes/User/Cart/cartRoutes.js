const express = require('express');
const router = express.Router();
const cartController = require('../../../Controller/User/Cart/cartController');
const jwtVerify = require('../../../Middlewares/jwtMiddleware')

router.post('/add', jwtVerify(['user']), cartController.addToCart);
router.get('/get', jwtVerify(['user']), cartController.getCart);
router.patch('/update', jwtVerify(['user']), cartController.updateCartItem);
router.delete('/remove', jwtVerify(['user']), cartController.removeCartItem);
router.post('/apply-coupon', jwtVerify(['user']), cartController.applyCoupon);
router.delete('/remove-coupon', jwtVerify(['user']), cartController.removeCoupon);

module.exports = router;

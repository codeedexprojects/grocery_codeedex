const express = require('express');
const router = express.Router();
const orderController = require('../../../Controller/User/Order/orderController');
const jwtVerify = require('../../../Middlewares/jwtMiddleware')


router.post('/create', jwtVerify(['user']), orderController.createOrder);
router.get('/my-orders', jwtVerify(['user']), orderController.getUserOrders);
router.get('/get/:orderId', jwtVerify(['user']), orderController.getOrderById);

router.put('/:orderId/status', jwtVerify(['user']),orderController.updateOrderStatus);

module.exports = router;

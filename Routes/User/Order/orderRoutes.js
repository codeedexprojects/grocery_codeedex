const express = require('express');
const router = express.Router();
const { createOrder, getOrders, getOrderById, updateOrderStatus } = require('../../../Controller/User/Order/orderController');
const jwtVerify = require('../../../Middlewares/jwtMiddleware')

router.post('/create', jwtVerify(['user']), createOrder);
router.get('/get', jwtVerify(['user']), getOrders);
router.get('/get/:id', jwtVerify(['user']), getOrderById);

router.put('/update/:id/status', jwtVerify(['user']), updateOrderStatus);

module.exports = router;

const express = require("express");
const router = express.Router();
const adminOrderController = require("../../../Controller/Admin/Orders/orderController");

// Get all orders
router.get("/get", adminOrderController.getAllOrders);

// Get single order by ID
router.get("/get/:orderId", adminOrderController.getOrderById);

// Update order status
router.put("/update/:orderId/status", adminOrderController.updateOrderStatus);

module.exports = router;

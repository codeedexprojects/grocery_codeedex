const express = require('express');
const router = express.Router();
const NotificationController = require('../../../Controller/User/Notification/notificationController');
const verifyToken = require('../../../Middlewares/jwtMiddleware')


// GET Notification
router.get('/', verifyToken(['user']), NotificationController.getUserNotifications);


// Mark as read
router.patch('/:id', verifyToken(['user']), NotificationController.markNotificationAsRead);

module.exports = router;

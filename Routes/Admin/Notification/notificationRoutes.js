const express = require('express');
const router = express.Router();
const { upload } = require('../../../Middlewares/multerMiddleware'); 
const notificationController = require('../../../Controller/Admin/Notification/notificationController');
const verifyAdmin = require('../../../Middlewares/jwtMiddleware');
const checkPermission = require('../../../Middlewares/checkPermission');


// Auth middleware
router.use(verifyAdmin(['admin', 'subadmin']));

// CRUD with permissions
router.post('/', checkPermission('create_notification'), upload.single('image'), notificationController.createNotification);
router.get('/', checkPermission('view_notification'), notificationController.getNotifications);
router.get('/:id', checkPermission('view_notification'), notificationController.getNotificationById);
router.patch('/:id', checkPermission('update_notification'), upload.single('image'), notificationController.updateNotification);
router.delete('/:id', checkPermission('delete_notification'), notificationController.deleteNotification);

// Send notifications
router.post('/send-user', checkPermission('send_notification'), notificationController.notifyUser);
router.post('/send-all', checkPermission('send_notification'), notificationController.notifyAllUsers);

module.exports = router;

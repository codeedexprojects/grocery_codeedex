const express = require('express');
const router = express.Router();
const verifyAdmin = require('../../../Middlewares/jwtMiddleware'); // your JWT middleware
const activityController = require('../../../Controller/Admin/ActivityLog/activityLogController');

// Only admins/subadmins can access
router.get('/', verifyAdmin(['admin', 'subadmin']), activityController.getAllActivityLogs);

// Logs by specific admin
router.get('/:adminId', verifyAdmin(['admin', 'subadmin']), activityController.getLogsByAdmin);

module.exports = router;

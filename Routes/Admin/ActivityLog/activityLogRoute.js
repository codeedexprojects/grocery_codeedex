const express = require('express');
const router = express.Router();
const verifyAdmin = require('../../../Middlewares/jwtMiddleware'); // your JWT middleware
const activityController = require('../../../Controller/Admin/ActivityLog/activityLogController');

// Only admins/subadmins can access
router.get('/', verifyAdmin(['superadmin', 'subadmin']), activityController.getAllActivityLogs);

// Logs by specific admin
router.get('/:adminId', verifyAdmin(['superadmin', 'subadmin']), activityController.getLogsByAdmin);

module.exports = router;

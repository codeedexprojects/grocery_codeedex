// adminLogger.js
const AdminLog = require('../Models/Admin/AdminActivityLog/activityLogModel');

const adminLogger = (moduleName, actionType) => async (req, res, next) => {
  res.on('finish', async () => {
    // Only log if response is successful
    if (res.statusCode >= 200 && res.statusCode < 300) {
      try {
        await AdminLog.create({
          admin: req.admin._id,
          role: req.admin.role,
          module: moduleName,
          action: actionType,
          recordId: req.params.id || req.body.id,
        });
      } catch (err) {
        console.error("Error logging admin action:", err);
      }
    }
  });

  next();
};

module.exports = adminLogger;

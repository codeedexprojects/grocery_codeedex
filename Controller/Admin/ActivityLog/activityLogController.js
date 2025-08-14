const ActivityLog = require('../../../Models/Admin/AdminActivityLog/activityLogModel')

// Get all admin activity logs
exports.getAllActivityLogs = async (req, res) => {
  try {
    const logs = await ActivityLog.find()
      .populate('admin', 'name email role') // optional: show admin details
      .sort({ createdAt: -1 }); // latest first

    res.status(200).json({
      success: true,
      count: logs.length,
      logs
    });
  } catch (error) {
    console.error("Error fetching activity logs:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getLogsByAdmin = async (req, res) => {
  try {
    const { adminId } = req.params;

    const logs = await ActivityLog.find({ admin: adminId })
      .populate('admin', 'name email role')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: logs.length,
      logs
    });
  } catch (error) {
    console.error("Error fetching logs by admin:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
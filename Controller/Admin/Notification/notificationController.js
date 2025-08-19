const Notification = require('../../../Models/Admin/Notification/notificationModel');
const fs = require('fs');
const UserModel = require('../../../Models/User/Auth/authModel');

// ✅ Create Notification (Admin creates one)
exports.createNotification = async (req, res) => {
  const { title, description, notificationType } = req.body;

  if (!title || !description) {
    return res.status(400).json({ message: "Title and description are required" });
  }

  try {
    const notification = await Notification.create({
      title,
      description,
      notificationType,
      image: req.file ? req.file.filename : null,
      ownerId: req.admin._id,
      role: req.admin.role === 'subadmin' ? 'Admin' : 'Admin',
    });

    res.status(201).json({ message: 'Notification created successfully', notification });
  } catch (err) {
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
  }
};

// ✅ Get notifications (with search + filter)
exports.getNotifications = async (req, res) => {
  try {
    const { title, notificationType } = req.query;
    const query = {};

    if (title) query.title = { $regex: title, $options: 'i' };
    if (notificationType) query.notificationType = notificationType;

    const notifications = await Notification.find(query).sort({ createdAt: -1 });
    res.status(200).json(notifications);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching notifications', error: err.message });
  }
};

// ✅ Get Notification By ID
exports.getNotificationById = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id).populate('ownerId');
    if (!notification) return res.status(404).json({ message: 'Notification not found' });

    res.status(200).json(notification);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching notification', error: err.message });
  }
};

// ✅ Update Notification
exports.updateNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) return res.status(404).json({ message: 'Notification not found' });

    const { title, description, date, time } = req.body;
    if (title) notification.title = title;
    if (description) notification.description = description;
    if (date) notification.date = date;
    if (time) notification.time = time;

    if (req.file) {
      const imagePath = `./uploads/notification/${notification.image}`;
      if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
      notification.image = req.file.filename;
    }

    await notification.save();
    res.status(200).json({ message: 'Notification updated successfully', notification });
  } catch (err) {
    res.status(500).json({ message: 'Error updating notification', error: err.message });
  }
};

// ✅ Delete Notification
exports.deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) return res.status(404).json({ message: 'Notification not found' });

    if (notification.image) {
      const imagePath = `./uploads/notification/${notification.image}`;
      if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    }

    await notification.deleteOne();
    res.status(200).json({ message: 'Notification deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting notification', error: err.message });
  }
};

// ✅ Send Notification to Single User (stored in DB only)
exports.notifyUser = async (req, res) => {
  try {
    const { userId, title, description, notificationType } = req.body;

    const user = await UserModel.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const notification = await Notification.create({
      userId,
      title,
      description,
      notificationType,
      ownerId: req.admin._id
    });

    res.status(200).json({ message: 'Notification stored for user', notification });
  } catch (err) {
    res.status(500).json({ message: 'Failed to store notification', error: err.message });
  }
};

// ✅ Send Notification to All Users (bulk store in DB)
exports.notifyAllUsers = async (req, res) => {
  try {
    const { title, description, notificationType } = req.body;

    const users = await UserModel.find({});
    if (!users.length) return res.status(404).json({ message: 'No users found' });

    const notifications = users.map(u => ({
      userId: u._id,
      title,
      description,
      notificationType,
      ownerId: req.admin._id
    }));

    await Notification.insertMany(notifications);

    res.status(200).json({ message: 'Notification stored for all users' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to store bulk notifications', error: err.message });
  }
};

const Notification = require('../../../Models/Admin/Notification/notificationModel');
const fs = require('fs');
const axios = require('axios');
const UserModel = require('../../../Models/User/Auth/authModel');

// Create Notification
exports.createNotification = async (req, res) => {
  const { title, description } = req.body;

  if (!req.file) return res.status(400).json({ message: "Notification Image is required" });

  try {
    const notification = await Notification.create({
      title,
      description,
      image: req.file.filename,
      ownerId: req.admin._id,
      role: req.admin.role === 'subadmin' ? 'Admin' : 'Admin',
    });

    res.status(201).json({ message: 'Notification created successfully', notification });
  } catch (err) {
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
  }
};

// ✅ Get notifications with optional title search and type filter
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


// Get Notification By ID
exports.getNotificationById = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id).populate('ownerId');
    if (!notification) return res.status(404).json({ message: 'Notification not found' });

    res.status(200).json(notification);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching notification', error: err.message });
  }
};

// Update Notification
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

// Delete Notification
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


exports.notifyUser = async (req, res) => {
  try {
    const { userId, notificationId, title, message, orderId, notificationType } = req.body;

    const user = await UserModel.findById(userId);
    if (!user || !user.playerId) {
      return res.status(404).json({ message: 'User or Player ID not found' });
    }

    let notificationData = {};

    // Use existing notification if notificationId is provided
    if (notificationId) {
      const existingNotification = await Notification.findById(notificationId);
      if (!existingNotification) return res.status(404).json({ message: 'Notification not found' });

      notificationData = {
        title: existingNotification.title,
        message: existingNotification.message,
        notificationType: existingNotification.notificationType,
        orderId: existingNotification.orderId
      };
    } else {
      // Create a new notification object
      if (!title || !message) {
        return res.status(400).json({ message: 'Title and message are required' });
      }
      notificationData = { title, message, notificationType, orderId };
      await Notification.create({ userId, ...notificationData });
    }

    // Send to user
    await sendNotification(user.playerId, notificationData.title, notificationData.message, { orderId: notificationData.orderId });

    res.status(200).json({ message: 'Notification sent to user' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to send notification', error: err.message });
  }
};

// ✅ Send Notification to All Users
exports.notifyAllUsers = async (req, res) => {
  try {
    const { notificationId, title, message, productId, categoryId, subCategoryId, notificationType } = req.body;

    const users = await UserModel.find({ playerId: { $exists: true, $ne: null } });
    if (users.length === 0) return res.status(404).json({ message: 'No users with player IDs found' });

    let notificationData = {};

    // Use existing notification if notificationId is provided
    if (notificationId) {
      const existingNotification = await Notification.findById(notificationId);
      if (!existingNotification) return res.status(404).json({ message: 'Notification not found' });

      notificationData = {
        title: existingNotification.title,
        message: existingNotification.message,
        notificationType: existingNotification.notificationType,
        productId: existingNotification.productId,
        categoryId: existingNotification.categoryId,
        subCategoryId: existingNotification.subCategoryId
      };
    } else {
      if (!title || !message) {
        return res.status(400).json({ message: 'Title and message are required' });
      }
      notificationData = { title, message, notificationType, productId, categoryId, subCategoryId };
    }

    const playerIds = users.map(u => u.playerId);
    await sendNotification(playerIds, notificationData.title, notificationData.message, {
      productId: notificationData.productId,
      categoryId: notificationData.categoryId,
      subCategoryId: notificationData.subCategoryId
    });

    // Save notifications for all users if creating new
    if (!notificationId) {
      const notifications = users.map(u => ({
        userId: u._id,
        ...notificationData
      }));
      await Notification.insertMany(notifications);
    }

    res.status(200).json({ message: 'Notification sent to all users' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to send bulk notification', error: err.message });
  }
};


// Helper: send notification via OneSignal
const sendNotification = async (playerIds, title, message, data = {}) => {
  const payload = {
    app_id: process.env.ONESIGNAL_APP_ID,
    include_player_ids: Array.isArray(playerIds) ? playerIds : [playerIds],
    headings: { en: title },
    contents: { en: message },
    data
  };

  await axios.post('https://onesignal.com/api/v1/notifications', payload, {
    headers: {
      Authorization: `Basic ${process.env.ONESIGNAL_REST_API_KEY}`,
      'Content-Type': 'application/json'
    }
  });
};

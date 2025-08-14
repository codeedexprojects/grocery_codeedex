const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  image: String,
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  role: { type: String, enum: ['Admin', 'Vendor'], default: 'Admin' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, 
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  subCategoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'SubCategory' },
  notificationType: { type: String, enum: ['info', 'alert', 'promo'], default: 'info' },
  isRead: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);

const mongoose = require('mongoose');

const adminLogSchema = new mongoose.Schema({
  admin: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true },
  role: { type: String, enum: ['admin', 'subadmin'], required: true },
  module: { type: String, required: true },
  action: { type: String, enum: ['create', 'update', 'delete'], required: true },
  recordId: { type: mongoose.Schema.Types.ObjectId }, 
}, { timestamps: true });

module.exports = mongoose.model('AdminLog', adminLogSchema);

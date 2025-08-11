const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String,  unique: true },
  number: { type: String, required: true, unique: true },
  isVerified: { type: Boolean, default: false },
  otp: String,
  otpExpiresAt: Date
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);

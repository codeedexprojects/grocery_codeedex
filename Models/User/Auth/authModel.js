const mongoose = require('mongoose');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String, unique: true },
  number: { type: String, required: true, unique: true },
  isVerified: { type: Boolean, default: false },
  otp: String,
  otpExpiresAt: Date,

  referralCode: { type: String, unique: true },
  referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  coins: { type: Number, default: 0 },
  role: { type: String, default: 'user' },
}, { timestamps: true });

// Generate referral code before saving
userSchema.pre('save', function (next) {
  if (!this.referralCode) {
    // Example: 8-char unique code from name + random string
    const randomString = crypto.randomBytes(3).toString('hex').toUpperCase();
    this.referralCode = `${this.name?.split(' ')[0] || 'USER'}-${randomString}`;
  }
  next();
});

module.exports = mongoose.model('User', userSchema);

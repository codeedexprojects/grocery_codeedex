const mongoose = require('mongoose');

const deletedUserSchema = new mongoose.Schema({
  email: String,
  number: String,
  referralCode: String,
  referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  deletedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('DeletedUser', deletedUserSchema);

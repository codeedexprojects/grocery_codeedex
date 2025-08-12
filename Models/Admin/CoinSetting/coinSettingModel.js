const mongoose = require('mongoose');

const coinSettingsSchema = new mongoose.Schema({
  referralBonus: { type: Number, default: 0 },    
  purchaseRate: { type: Number, default: 0 },
  redemptionRate: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('CoinSettings', coinSettingsSchema);

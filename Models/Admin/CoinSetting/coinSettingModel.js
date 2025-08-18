const mongoose = require('mongoose');

const coinSettingsSchema = new mongoose.Schema({
  referralBonus: { type: Number, default: 0 },
  purchaseThreshold: { type: Number, default: 1000 },
  coinsPerThreshold: { type: Number, default: 50 },
  redemptionRate: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('CoinSettings', coinSettingsSchema);

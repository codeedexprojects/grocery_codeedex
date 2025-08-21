const mongoose = require('mongoose');

const deliveryChargeSchema = new mongoose.Schema({
  minAmount: {
    type: Number,
    required: true,
    default: 0
  },
  maxAmount: {
    type: Number,
    required: true
  },
  charge: {
    type: Number,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('DeliveryCharge', deliveryChargeSchema);

const mongoose = require('mongoose');

const checkoutSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  cart: { type: mongoose.Schema.Types.ObjectId, ref: 'Cart', required: true },
  
  subtotal: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  couponDiscount: { type: Number, default: 0 },
  deliveryCharge: { type: Number, default: 0 },
  coinDiscount: { type: Number, default: 0 },   
  coinsUsed: { type: Number, default: 0 },     
  total: { type: Number, default: 0 },
  
  status: { type: String, default: 'pending' },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Checkout', checkoutSchema);
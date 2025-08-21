const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  comboOffer: { type: mongoose.Schema.Types.ObjectId, ref: 'ComboOffer' },
  weight: String,
  measurm: String,
  quantity: { type: Number, default: 1, min: 1 },
  price: { type: Number, required: true },
  isCombo: { type: Boolean, default: false }
}, { _id: false });

const cartSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [cartItemSchema],
  subtotal: { type: Number, default: 0 },        
  discount: { type: Number, default: 0 },        
  couponDiscount: { type: Number, default: 0 }, 
  total: { type: Number, default: 0 },           
  appliedCoupon: {
    code: String,
    discount: Number,
    couponId: { type: mongoose.Schema.Types.ObjectId, ref: 'Coupon' }
  }
}, { timestamps: true });

module.exports = mongoose.model('Cart', cartSchema);
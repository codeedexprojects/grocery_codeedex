const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  comboOffer: { type: mongoose.Schema.Types.ObjectId, ref: 'ComboOffer' },
  weight: String,
  measurm: String,
  quantity: { type: Number, default: 1 },
  price: Number,
  isCombo: { type: Boolean, default: false }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [orderItemSchema],
  subtotal: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  couponDiscount: { type: Number, default: 0 },
  coinDiscount: { type: Number, default: 0 },
  deliveryCharge: { type: Number, default: 0 },
  coinsUsed: { type: Number, default: 0 },
  coinsEarned: { type: Number, default: 0 },
  total: { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'paid', 'failed'],
    default: 'unpaid'
  },
  paymentMethod: {
    type: String,
    enum: ['COD', 'UPI', 'CARD', 'NETBANKING'],
    default: 'COD'
  },
  shippingAddress: {
    name: String,
    phone: String,
    house: String,
    street: String,
    city: String,
    state: String,
    postalCode: String,
    country: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
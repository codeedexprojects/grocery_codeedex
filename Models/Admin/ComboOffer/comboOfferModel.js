const mongoose = require('mongoose');

const comboProductSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  weight: String,          
  measurm: String,         
  quantity: { type: Number, required: true } 
}, { _id: false });

const comboOfferSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'ComboCategory',
    required: true
  },
  image: String,
  products: [comboProductSchema],
  discountType: { type: String, enum: ['fixed', 'percentage'], default: 'fixed' },
  discountValue: { type: Number, required: true },
  startDate: Date,
  endDate: Date,
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('ComboOffer', comboOfferSchema);

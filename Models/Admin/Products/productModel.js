const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema({
  weight: String,
  measurm: String, 
  weight_price: Number,
  quantity: Number,
}, { _id: false });

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  mainCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'MainCategory', required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  subCategory: { 
  type: mongoose.Schema.Types.ObjectId, 
  ref: 'Subcategory', 
  required: true 
},

  price: { type: Number, required: true },
  offerPrice: Number,
  discountPercentage: Number,
  measurment: String,

  weightsAndStocks: [stockSchema],

  images: [String], 

  isPopular: { type: Boolean, default: false },
  isOfferProduct: { type: Boolean, default: false },
  isAvailable: { type: Boolean, default: true },
  isSeasonal: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);

const mongoose = require('mongoose');

const carouselSchema = new mongoose.Schema({
  title: { type: String, required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  image: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Carousel', carouselSchema);

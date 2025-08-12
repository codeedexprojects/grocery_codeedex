const mongoose = require('mongoose');

const carouselSchema = new mongoose.Schema({
  title: { type: String, required: true },
  products: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true }
  ],
  image: { type: String, required: true },
  secondaryImage: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Carousel', carouselSchema);

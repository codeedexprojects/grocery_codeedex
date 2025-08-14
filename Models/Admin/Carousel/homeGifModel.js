const mongoose = require('mongoose');

const homeCarouselSchema = new mongoose.Schema({
  backgroundImage: { type: String, required: true },
  gif: { type: String, required: true }, // only one gif
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('HomeCarousel', homeCarouselSchema);

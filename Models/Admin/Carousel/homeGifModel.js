const mongoose = require('mongoose');

const homeCarouselSchema = new mongoose.Schema({
  backgroundImage: { type: String, required: true },
  gifs: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('HomeCarousel', homeCarouselSchema);

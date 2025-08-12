const mongoose = require('mongoose');

const homeCarouselSchema = new mongoose.Schema({
  title: { type: String, required: true }, 
  backgroundImage: { type: String, required: true }, 
  gifs: [{ type: String }], 

  sections: [
    {
      subTitle: { type: String, required: true },
      productIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }]
    }
  ],

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('HomeCarousel', homeCarouselSchema);

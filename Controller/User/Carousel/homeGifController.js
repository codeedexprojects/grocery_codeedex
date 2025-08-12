const HomeCarousel = require('../../../Models/Admin/Carousel/homeGifModel');
const fs = require('fs');

exports.getAllCarousels = async (req, res) => {
  try {
    const carousels = await HomeCarousel.find().populate('sections.productIds');
    res.json(carousels);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching carousels', error: error.message });
  }
};
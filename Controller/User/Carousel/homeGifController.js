const HomeCarousel = require('../../../Models/Admin/Carousel/homeGifModel');
const fs = require('fs');

exports.getCarousel = async (req, res) => {
  try {
    const carousel = await HomeCarousel.findOne();
    if (!carousel) {
      return res.status(404).json({ message: 'No carousel found' });
    }
    res.json(carousel);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching carousel', error: error.message });
  }
};
const Carousel = require('../../../Models/Admin/Carousel/carouselModel');


// Get all carousels
exports.getCarousels = async (req, res) => {
  try {
    const carousels = await Carousel.find()
      .populate('products'); // updated to products
    res.json(carousels);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
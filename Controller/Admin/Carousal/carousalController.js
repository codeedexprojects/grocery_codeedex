const Carousel = require('../../../Models/Admin/Carousal/carousalModel');

// Create carousel
const createCarousel = async (req, res) => {
  try {
    const { title, product } = req.body;
    const image = req.file?.filename;
    if (!title || !product || !image) {
      return res.status(400).json({ message: 'Title, product and image are required.' });
    }
    const carousel = new Carousel({ title, product, image });
    await carousel.save();
    res.status(201).json({ message: 'Carousel created successfully', carousel });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all carousels
const getCarousels = async (req, res) => {
  try {
    const carousels = await Carousel.find().populate('product', 'name');
    res.json(carousels);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete carousel
const deleteCarousel = async (req, res) => {
  try {
    const { id } = req.params;
    await Carousel.findByIdAndDelete(id);
    res.json({ message: 'Carousel deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createCarousel,
  getCarousels,
  deleteCarousel
};
const Carousel = require('../../../Models/Admin/Carousel/carouselModel');

// Create carousel
exports.createCarousel = async (req, res) => {
  try {
    const { title, products } = req.body;
    const image = req.files?.image?.[0]?.filename;
    const secondaryImage = req.files?.secondaryImage?.[0]?.filename;

    // Validation
    if (!title || !products || !image) {
      return res.status(400).json({ message: 'Title, products, and image are required.' });
    }
    
    // Ensure products is an array
    const productsArray = Array.isArray(products) ? products : [products];
    
    const carousel = new Carousel({
      title,
      products: productsArray,
      image,
      secondaryImage
    });

    await carousel.save();

    res.status(201).json({ message: 'Carousel created successfully', carousel });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all carousels
exports.getCarousels = async (req, res) => {
  try {
    const carousels = await Carousel.find()
      .populate('products', 'name'); // updated to products
    res.json(carousels);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete carousel
exports.deleteCarousel = async (req, res) => {
  try {
    const { id } = req.params;
    await Carousel.findByIdAndDelete(id);
    res.json({ message: 'Carousel deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

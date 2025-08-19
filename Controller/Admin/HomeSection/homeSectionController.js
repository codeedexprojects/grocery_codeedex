const HomeSection = require('../../../Models/Admin/HomeSection/homeSectionModel');
const Product = require('../../../Models/Admin/Products/productModel');

// Create a new home section
const createHomeSection = async (req, res) => {
  try {
    const { title, products } = req.body;

    const newSection = new HomeSection({ title, products });
    await newSection.save();

    res.status(201).json({ message: 'Home section created successfully', section: newSection });
  } catch (err) {
    console.error('Error creating home section:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get all home sections with products
const getHomeSections = async (req, res) => {
  try {
    const sections = await HomeSection.find()
      .populate('products');

    res.json(sections);
  } catch (err) {
    console.error('Error fetching home sections:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get a single home section by ID
const getHomeSectionById = async (req, res) => {
  try {
    const section = await HomeSection.findById(req.params.id)
      .populate('products');

    if (!section) return res.status(404).json({ message: 'Home section not found' });

    res.json(section);
  } catch (err) {
    console.error('Error fetching home section:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update home section
const updateHomeSection = async (req, res) => {
  try {
    const { title, products } = req.body;

    const updatedSection = await HomeSection.findByIdAndUpdate(
      req.params.id,
      { title, products },
      { new: true }
    ).populate('products', 'name price offerPrice images category subCategory');

    if (!updatedSection) return res.status(404).json({ message: 'Home section not found' });

    res.json({ message: 'Home section updated successfully', section: updatedSection });
  } catch (err) {
    console.error('Error updating home section:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Delete home section
const deleteHomeSection = async (req, res) => {
  try {
    const deletedSection = await HomeSection.findByIdAndDelete(req.params.id);
    if (!deletedSection) return res.status(404).json({ message: 'Home section not found' });

    res.json({ message: 'Home section deleted successfully' });
  } catch (err) {
    console.error('Error deleting home section:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = {
  createHomeSection,
  getHomeSections,
  getHomeSectionById,
  updateHomeSection,
  deleteHomeSection
};

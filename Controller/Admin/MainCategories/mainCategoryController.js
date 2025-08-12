const MainCategory = require('../../../Models/Admin/MainCategories/mainCategoryModel');

// Create new category
const createCategory = async (req, res) => {
  try {
    const { name, status, primaryColor, secondaryColor } = req.body;
    const image = req.file?.filename;

    if (!name || !image) {
      return res.status(400).json({ message: 'Name and image are required' });
    }
    const existing = await MainCategory.findOne({ name });
    if (existing) {
      return res.status(400).json({ message: 'Category already exists' });
    }

    const category = new MainCategory({ name, image, status, primaryColor, secondaryColor });
    await category.save();

    res.status(201).json({ message: 'Category created successfully', category });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all categories
const getCategories = async (req, res) => {
  try {
    const categories = await MainCategory.find().sort({ createdAt: -1 });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get single category
const getCategoryById = async (req, res) => {
  try {
    const category = await MainCategory.findById(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.json(category);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Update category
const updateCategory = async (req, res) => {
  try {
    const { name, status, primaryColor, secondaryColor } = req.body;
    const image = req.file?.filename;

    const category = await MainCategory.findById(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });

    category.name = name || category.name;
    category.status = status !== undefined ? status : category.status;
    category.primaryColor = primaryColor || category.primaryColor;
    category.secondaryColor = secondaryColor || category.secondaryColor;
    if (image) category.image = image;

    await category.save();
    res.json({ message: 'Category updated', category });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete category
const deleteCategory = async (req, res) => {
  try {
    const category = await MainCategory.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.json({ message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory
};

const Subcategory = require('../../../Models/Admin/SubCategory/subCategoryModel');

// Create new subcategory
const createSubcategory = async (req, res) => {
  try {
    const { name, category, status ,image: imageUrl} = req.body;
    const image = req.file?.filename || imageUrl;

    if (!name || !image || !category) {
      return res.status(400).json({ message: 'Name, image and category are required' });
    }

    const existing = await Subcategory.findOne({ name });
    if (existing) {
      return res.status(400).json({ message: 'Subcategory already exists' });
    }

    const subcategory = new Subcategory({ name, image, category, status });
    await subcategory.save();

    res.status(201).json({ message: 'Subcategory created successfully', subcategory });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all subcategories
const getSubcategories = async (req, res) => {
  try {
    const subcategories = await Subcategory.find().populate('category').sort({ createdAt: -1 });
    res.json(subcategories);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get subcategories by category
const getSubcategoriesByCategory = async (req, res) => {
  try {
    const subcategories = await Subcategory.find({ category: req.params.categoryId })
      .populate('category')
      .sort({ createdAt: -1 });
    res.json(subcategories);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get single subcategory
const getSubcategoryById = async (req, res) => {
  try {
    const subcategory = await Subcategory.findById(req.params.id).populate('category');
    if (!subcategory) return res.status(404).json({ message: 'Subcategory not found' });
    res.json(subcategory);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Update subcategory
const updateSubcategory = async (req, res) => {
  try {
    const { name, category, status ,image: imageUrl} = req.body;
    const image = req.file?.filename || imageUrl;

    const subcategory = await Subcategory.findById(req.params.id);
    if (!subcategory) return res.status(404).json({ message: 'Subcategory not found' });

    subcategory.name = name || subcategory.name;
    subcategory.status = status !== undefined ? status : subcategory.status;
    if (image) subcategory.image = image;
    if (category) subcategory.category = category;

    await subcategory.save();
    res.json({ message: 'Subcategory updated', subcategory });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete subcategory
const deleteSubcategory = async (req, res) => {
  try {
    const subcategory = await Subcategory.findByIdAndDelete(req.params.id);
    if (!subcategory) return res.status(404).json({ message: 'Subcategory not found' });
    res.json({ message: 'Subcategory deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Search Sub categories
const searchSubCategories = async (req, res) => {
  try {
    const { search } = req.query;

    const filter = {};

    // ✅ Search by name (case insensitive)
    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }


    const categories = await Subcategory.find(filter).sort({ createdAt: -1 });

    res.json(categories);
  } catch (err) {
    console.error("Error searching categories:", err);
    res.status(500).json({ message: "Server error" });
  }
};



module.exports = {
  createSubcategory,
  getSubcategories,
  getSubcategoriesByCategory,
  getSubcategoryById,
  updateSubcategory,
  deleteSubcategory,
  searchSubCategories
};
const ComboCategory = require("../../../Models/Admin/ComboOffer/comboCategoryModel");

// Create category
const createCategory = async (req, res) => {
  try {
    const { title, status } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    const exists = await ComboCategory.findOne({ title });
    if (exists) {
      return res.status(400).json({ message: "Category already exists" });
    }

    const category = new ComboCategory({ title, status });
    await category.save();

    res.status(201).json({ message: "Category created successfully", category });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get all categories
const getCategories = async (req, res) => {
  try {
    const categories = await ComboCategory.find().sort({ createdAt: -1 });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get single category
const getCategoryById = async (req, res) => {
  try {
    const category = await ComboCategory.findById(req.params.id);
    if (!category) return res.status(404).json({ message: "Category not found" });
    res.json(category);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Update category
const updateCategory = async (req, res) => {
  try {
    const { title, status } = req.body;

    const category = await ComboCategory.findById(req.params.id);
    if (!category) return res.status(404).json({ message: "Category not found" });

    category.title = title || category.title;
    category.status = status !== undefined ? status : category.status;

    await category.save();
    res.json({ message: "Category updated", category });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Delete category
const deleteCategory = async (req, res) => {
  try {
    const category = await ComboCategory.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ message: "Category not found" });
    res.json({ message: "Category deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};

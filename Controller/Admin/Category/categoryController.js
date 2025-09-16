const Category = require('../../../Models/Admin/Category/categoryModel');

const createCategory = async (req, res) => {
  try {
    const { name, mainCategory, status, image: imageUrl } = req.body;
    const image = req.file?.filename || imageUrl;

    if (!name || !mainCategory || !image) {
      return res.status(400).json({ message: 'Name, Main Category, and Image are required' });
    }

    const exists = await Category.findOne({ name });
    if (exists) return res.status(400).json({ message: 'Category already exists' });

    const category = new Category({ name, image, mainCategory, status });
    await category.save();

    res.status(201).json({ message: 'Category created successfully', category });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};


const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().populate('mainCategory').sort({ createdAt: -1 });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id).populate('mainCategory', 'name');
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.json(category);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { name, mainCategory, status } = req.body;
    const image = req.file?.filename;

    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });

    category.name = name || category.name;
    category.mainCategory = mainCategory || category.mainCategory;
    category.status = status !== undefined ? status : category.status;
    if (image) category.image = image;

    await category.save();
    res.json({ message: 'Category updated', category });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.json({ message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Search categories
const searchCategories = async (req, res) => {
  try {
    const { search } = req.query;

    const filter = {};

    // ✅ Search by name (case insensitive)
    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }


    const categories = await Category.find(filter).sort({ createdAt: -1 });

    res.json(categories);
  } catch (err) {
    console.error("Error searching categories:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const getCategoriesByMainCategory = async (req, res) => {
  try {
    const { mainCategoryId } = req.params;

    const categories = await Category.find({ mainCategory: mainCategoryId })
      .populate("mainCategory", "name")
      .sort({ createdAt: -1 });

    if (!categories.length) {
      return res.status(404).json({ message: "No categories found for this Main Category" });
    }

    res.json(categories);
  } catch (err) {
    console.error("Error fetching categories by main category:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  searchCategories,
  getCategoriesByMainCategory
};

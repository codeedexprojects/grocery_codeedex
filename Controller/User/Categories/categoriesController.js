const Category = require('../../../Models/Admin/Category/categoryModel');
const SubCategory = require('../../../Models/Admin/SubCategory/subCategoryModel');
const MainCategory = require('../../../Models/Admin/MainCategories/mainCategoryModel');

exports.getAllCategoriesWithSubcategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    const result = [];
    for (let cat of categories) {
      const subCategories = await SubCategory.find({ category: cat._id }).sort({ name: 1 });
      result.push({
        category: cat, 
        subCategories 
      });
    }
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error fetching categories with subcategories:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

exports.getCategoriesByMainCategory = async (req, res) => {
  try {
    const { mainCategoryId } = req.params;
    const mainCat = await MainCategory.findById(mainCategoryId);
    if (!mainCat) {
      return res.status(404).json({
        success: false,
        message: 'Main category not found'
      });
    }
    const categories = await Category.find({ mainCategory: mainCategoryId }).sort({ name: 1 });
    const result = [];
    for (let cat of categories) {
      const subCategories = await SubCategory.find({ category: cat._id }).sort({ name: 1 });
      result.push({
        category: cat,
        subCategories
      });
    }
    res.json({
      success: true,
      mainCategory: mainCat,
      data: result
    });
  } catch (error) {
    console.error('Error fetching categories by main category:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
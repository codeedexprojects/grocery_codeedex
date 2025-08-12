const MainCategory = require('../../../Models/Admin/MainCategories/mainCategoryModel');


const getCategories = async (req, res) => {
  try {
    const categories = await MainCategory.find().sort({ createdAt: -1 });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getCategories,

};
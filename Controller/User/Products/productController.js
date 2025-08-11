const Product = require('../../../Models/Admin/Products/productModel');

const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate('mainCategory', 'name')
      .populate('category', 'name')
      .populate('subCategory', 'name');
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('mainCategory', 'name')
      .populate('category', 'name')
      .populate('subCategory', 'name');
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
};

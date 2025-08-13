const Product = require('../../../Models/Admin/Products/productModel');
const Wishlist = require('../../../Models/User/Wishlist/wishlistModel');

const getAllProducts = async (req, res) => {
  try {
    const userId = req.user?._id; // Get user ID if authenticated
    
    let products = await Product.find()
      .populate('mainCategory', 'name')
      .populate('category', 'name')
      .populate('subCategory', 'name');
    
    // If user is authenticated, check wishlist status
    if (userId) {
      const wishlist = await Wishlist.findOne({ user: userId });
      const wishlistProductIds = wishlist?.products.map(item => item.product.toString()) || [];
      
      products = products.map(product => ({
        ...product.toObject(),
        isWishlist: wishlistProductIds.includes(product._id.toString())
      }));
    } else {
      // For non-authenticated users, set isWishlist to false
      products = products.map(product => ({
        ...product.toObject(),
        isWishlist: false
      }));
    }
    
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getProductById = async (req, res) => {
  try {
    const userId = req.user?._id;
    const product = await Product.findById(req.params.id)
      .populate('mainCategory', 'name')
      .populate('category', 'name')
      .populate('subCategory', 'name');
      
    if (!product) return res.status(404).json({ message: 'Product not found' });
    
    let productWithWishlistStatus = product.toObject();
    
    if (userId) {
      const wishlist = await Wishlist.findOne({ 
        user: userId,
        'products.product': product._id 
      });
      productWithWishlistStatus.isWishlist = !!wishlist;
    } else {
      productWithWishlistStatus.isWishlist = false;
    }
    
    res.json(productWithWishlistStatus);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getProductsByMainCategory = async (req, res) => {
  try {
    const { mainCategoryId } = req.params;
    const userId = req.user?._id;

    let products = await Product.find({ mainCategory: mainCategoryId })
      .populate('mainCategory', 'name')
      .populate('category', 'name')
      .populate('subCategory', 'name');

    if (products.length === 0) {
      return res.status(404).json({ message: 'No products found for this main category' });
    }

    // If user is authenticated, check wishlist status
    if (userId) {
      const wishlist = await Wishlist.findOne({ user: userId });
      const wishlistProductIds = wishlist?.products.map(item => item.product.toString()) || [];
      
      products = products.map(product => ({
        ...product.toObject(),
        isWishlist: wishlistProductIds.includes(product._id.toString())
      }));
    } else {
      // For non-authenticated users, set isWishlist to false
      products = products.map(product => ({
        ...product.toObject(),
        isWishlist: false
      }));
    }

    res.json(products);
  } catch (err) {
    console.error('Error fetching products by main category:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  getProductsByMainCategory
};
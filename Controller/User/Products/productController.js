const Product = require('../../../Models/Admin/Products/productModel');
const Wishlist = require('../../../Models/User/Wishlist/wishlistModel');
const Cart = require('../../../Models/User/Cart/cartModel');

// Helper function to get cart items map for a user
const getCartItemsMap = async (userId) => {
  const cartItemsMap = new Map();
  if (userId) {
    const cart = await Cart.findOne({ user: userId });
    if (cart) {
      cart.items.forEach(item => {
        if (!item.isCombo && item.product) {
          const productId = item.product.toString();
          if (!cartItemsMap.has(productId)) {
            cartItemsMap.set(productId, []);
          }
          cartItemsMap.get(productId).push({
            inCart: true,
            weight: item.weight,
            measurm: item.measurm,
            quantity: item.quantity,
            cartItemId: item._id
          });
        }
      });
    }
  }
  return cartItemsMap;
};

// Helper function to get wishlist product IDs for a user
const getWishlistProductIds = async (userId) => {
  if (!userId) return [];
  const wishlist = await Wishlist.findOne({ user: userId });
  return wishlist?.products.map(item => item.product.toString()) || [];
};

const getAllProducts = async (req, res) => {
  try {
    const userId = req.user?._id; 
    
    let products = await Product.find()
      .populate('mainCategory', 'name')
      .populate('category', 'name')
      .populate('subCategory', 'name');

    const wishlistProductIds = await getWishlistProductIds(userId);
    const cartItemsMap = await getCartItemsMap(userId);
    
    products = products.map(product => {
      const productObj = product.toObject();
      const productId = product._id.toString();
      
      return {
        ...productObj,
        isWishlist: wishlistProductIds.includes(productId),
        cartItems: cartItemsMap.get(productId) || []
      };
    });
    
    res.json(products);
  } catch (err) {
    console.error('Error in getAllProducts:', err);
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
    
    const productObj = product.toObject();
    const productId = product._id.toString();
    
    const wishlistProductIds = await getWishlistProductIds(userId);
    const cartItemsMap = await getCartItemsMap(userId);
    
    const response = {
      ...productObj,
      isWishlist: wishlistProductIds.includes(productId),
      cartItems: cartItemsMap.get(productId) || []
    };
    
    res.json(response);
  } catch (err) {
    console.error('Error in getProductById:', err);
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

    const wishlistProductIds = await getWishlistProductIds(userId);
    const cartItemsMap = await getCartItemsMap(userId);
    
    products = products.map(product => {
      const productObj = product.toObject();
      const productId = product._id.toString();
      
      return {
        ...productObj,
        isWishlist: wishlistProductIds.includes(productId),
        cartItems: cartItemsMap.get(productId) || []
      };
    });

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
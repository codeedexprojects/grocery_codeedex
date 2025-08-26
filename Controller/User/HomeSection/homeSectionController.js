const HomeSection = require('../../../Models/Admin/HomeSection/homeSectionModel');
const Wishlist = require('../../../Models/User/Wishlist/wishlistModel');
const Cart = require('../../../Models/User/Cart/cartModel');
const Product = require('../../../Models/Admin/Products/productModel'); // Make sure to import Product model

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

const getWishlistProductIds = async (userId) => {
  if (!userId) return [];
  const wishlist = await Wishlist.findOne({ user: userId });
  return wishlist?.products.map(item => item.product.toString()) || [];
};

const getHomeSections = async (req, res) => {
  try {
    const userId = req.user?._id;

    let sections = await HomeSection.find()
      .populate({
        path: 'products',
        populate: [
          { path: 'mainCategory', select: 'name' },
          { path: 'category', select: 'name' },
          { path: 'subCategory', select: 'name' }
        ]
      });

    const wishlistProductIds = await getWishlistProductIds(userId);
    const cartItemsMap = await getCartItemsMap(userId);

    sections = sections.map(section => {
      const sectionObj = section.toObject();
      sectionObj.products = sectionObj.products.map(product => {
        const productId = product._id.toString();
        return {
          ...product,
          finalPrice: product.offerPrice || product.price,
          isWishlist: wishlistProductIds.includes(productId),
          cartItems: cartItemsMap.get(productId) || []
        };
      });
      return sectionObj;
    });

    res.json(sections);
  } catch (err) {
    console.error('Error fetching home sections:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// 🔹 Get single home section with wishlist/cart info
const getHomeSectionById = async (req, res) => {
  try {
    const userId = req.user?._id;

    let section = await HomeSection.findById(req.params.id)
      .populate({
        path: 'products',
        populate: [
          { path: 'mainCategory', select: 'name' },
          { path: 'category', select: 'name' },
          { path: 'subCategory', select: 'name' }
        ]
      });

    if (!section) return res.status(404).json({ message: 'Home section not found' });

    const wishlistProductIds = await getWishlistProductIds(userId);
    const cartItemsMap = await getCartItemsMap(userId);

    const sectionObj = section.toObject();
    sectionObj.products = sectionObj.products.map(product => {
      const productId = product._id.toString();
      return {
        ...product,
        finalPrice: product.offerPrice || product.price,
        isWishlist: wishlistProductIds.includes(productId),
        cartItems: cartItemsMap.get(productId) || []
      };
    });

    res.json(sectionObj);
  } catch (err) {
    console.error('Error fetching home section:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getAllProducts = async (req, res) => {
  try {
    const userId = req.user?._id;
    
    const {
      q,
      mainCategory,
      category,
      subCategory,
      minPrice,
      maxPrice,
      isPopular,
      isOfferProduct,
      isAvailable,
      isSeasonal,
      sortBy 
    } = req.query;

    const filter = {};

    if (q?.trim()) {
      filter.name = new RegExp(q, 'i');
    }

    if (mainCategory) filter.mainCategory = mainCategory;
    if (category) filter.category = category;
    if (subCategory) filter.subCategory = subCategory;

    if (isPopular !== undefined) filter.isPopular = isPopular === 'true';
    if (isOfferProduct !== undefined) filter.isOfferProduct = isOfferProduct === 'true';
    if (isAvailable !== undefined) filter.isAvailable = isAvailable === 'true';
    if (isSeasonal !== undefined) filter.isSeasonal = isSeasonal === 'true';

    let products = await Product.find(filter)
      .populate('mainCategory', 'name')
      .populate('category', 'name')
      .populate('subCategory', 'name');

    // Apply price filtering
    products = products.filter(product => {
      const finalPrice = product.offerPrice || product.price;
      if (minPrice && finalPrice < Number(minPrice)) return false;
      if (maxPrice && finalPrice > Number(maxPrice)) return false;
      return true;
    });

    // Sorting
    if (sortBy) {
      if (sortBy === 'priceAsc') {
        products.sort((a, b) => (a.offerPrice || a.price) - (b.offerPrice || b.price));
      } else if (sortBy === 'priceDesc') {
        products.sort((a, b) => (b.offerPrice || b.price) - (a.offerPrice || a.price));
      } else if (sortBy === 'newest') {
        products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }
    }

    // Get user-specific data
    const wishlistProductIds = await getWishlistProductIds(userId);
    const cartItemsMap = await getCartItemsMap(userId);

    // Prepare response
    products = products.map(product => {
      const productObj = product.toObject();
      const productId = product._id.toString();
      
      return {
        ...productObj,
        finalPrice: product.offerPrice || product.price,
        isWishlist: wishlistProductIds.includes(productId),
        cartItems: cartItemsMap.get(productId) || []
      };
    });

    res.status(200).json({
      total: products.length,
      products
    });

  } catch (err) {
    console.error('Error in getAllProducts:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = {
  getHomeSections,
  getHomeSectionById,
  getAllProducts
};
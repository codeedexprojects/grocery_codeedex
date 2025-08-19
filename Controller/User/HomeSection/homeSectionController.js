const HomeSection = require('../../../Models/Admin/HomeSection/homeSectionModel');
const Wishlist = require('../../../Models/User/Wishlist/wishlistModel');
const Cart = require('../../../Models/User/Cart/cartModel');

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
      .populate('products');

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
      .populate('products');

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

module.exports = {
  getHomeSections,
  getHomeSectionById
};

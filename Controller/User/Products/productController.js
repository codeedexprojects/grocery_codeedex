const Product = require('../../../Models/Admin/Products/productModel');
const Wishlist = require('../../../Models/User/Wishlist/wishlistModel');

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

    // Wishlist integration
    if (userId) {
      const wishlist = await Wishlist.findOne({ user: userId });
      const wishlistProductIds = wishlist?.products.map(item => item.product.toString()) || [];

      products = products.map(product => ({
        ...product.toObject(),
        finalPrice: product.offerPrice || product.price,
        isWishlist: wishlistProductIds.includes(product._id.toString())
      }));
    } else {
      products = products.map(product => ({
        ...product.toObject(),
        finalPrice: product.offerPrice || product.price,
        isWishlist: false
      }));
    }

    res.status(200).json({
      total: products.length,
      products
    });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
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
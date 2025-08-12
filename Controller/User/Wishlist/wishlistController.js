const Wishlist = require('../../../Models/User/Wishlist/wishlistModel');
const Product = require('../../../Models/Admin/Products/productModel');
const mongoose = require('mongoose');
const User = require('../../../Models/User/Auth/authModel')


exports.addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user._id; 

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    let wishlist = await Wishlist.findOne({ user: userId });

    if (!wishlist) {
      wishlist = new Wishlist({
        user: userId,
        products: [{ product: productId }]
      });
    } else {
      // Check if product already exists in wishlist
      const existingProduct = wishlist.products.find(
        item => item.product && item.product.toString() === productId
      );

      if (existingProduct) {
        return res.status(400).json({ message: 'Product already in wishlist' });
      }

      wishlist.products.push({ product: productId });
    }

    await wishlist.save();
    
    // Populate the product details in the response
    const populatedWishlist = await Wishlist.findById(wishlist._id)
      .populate('products.product', 'name price offerPrice images isAvailable');

    res.status(200).json({ 
      message: 'Product added to wishlist', 
      wishlist: populatedWishlist 
    });
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
};

exports.removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user._id;

    // Validate productId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    const wishlist = await Wishlist.findOne({ user: userId });

    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }

    // Check if product exists in wishlist before removing
    const initialLength = wishlist.products.length;
    wishlist.products = wishlist.products.filter(
      item => item.product && item.product.toString() !== productId
    );

    if (initialLength === wishlist.products.length) {
      return res.status(404).json({ message: 'Product not found in wishlist' });
    }

    await wishlist.save();

    // Populate the remaining products
    const populatedWishlist = await Wishlist.findById(wishlist._id)
      .populate('products.product', 'name price offerPrice images isAvailable');

    res.status(200).json({ 
      message: 'Product removed from wishlist', 
      wishlist: populatedWishlist 
    });
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
};

exports.getWishlist = async (req, res) => {
  try {
    const userId = req.user._id;

    // Check if user exists (optional additional validation)
    const userExists = await User.exists({ _id: userId });
    if (!userExists) {
      return res.status(404).json({ message: 'User not found' });
    }

    const wishlist = await Wishlist.findOne({ user: userId })
      .populate('products.product', 'name price offerPrice images isAvailable');

    if (!wishlist) {
      return res.status(200).json({ products: [] });
    }

    res.status(200).json(wishlist);
  } catch (error) {
    console.error('Error getting wishlist:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
};

exports.clearWishlist = async (req, res) => {
  try {
    const userId = req.user._id;

    const wishlist = await Wishlist.findOneAndUpdate(
      { user: userId },
      { $set: { products: [] } },
      { new: true, runValidators: true }
    ).populate('products.product', 'name price offerPrice images isAvailable');

    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }

    res.status(200).json({ 
      message: 'Wishlist cleared', 
      wishlist 
    });
  } catch (error) {
    console.error('Error clearing wishlist:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
};
const User = require('../../../Models/User/Auth/authModel'); 
const Cart = require('../../../Models/User/Cart/cartModel')
const Wishlist = require('../../../Models/User/Wishlist/wishlistModel')

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    let { page = 1, limit = 10 } = req.query; 
    page = parseInt(page);
    limit = parseInt(limit);

    const skip = (page - 1) * limit;

    const totalUsers = await User.countDocuments();
    const users = await User.find()
      .populate({
        path: 'referredBy',
        select: 'name email number referralCode'
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
      
    res.status(200).json({
      totalUsers,
      currentPage: page,
      totalPages: Math.ceil(totalUsers / limit),
      users
    });
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id)
      .populate({
        path: 'referredBy',
        select: 'name email number referralCode'
      });
      
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const cart = await Cart.findOne({ user: id })
      .populate({
        path: 'items.product',
        select: 'name price offerPrice measurment images weightsAndStocks'
      });
      
    const wishlist = await Wishlist.findOne({ user: id })
      .populate({
        path: 'items.product',
        select: 'name price offerPrice measurment images weightsAndStocks'
      });

    // Get referral statistics for this user
    const referralCount = await User.countDocuments({ referredBy: id });

    res.status(200).json({
      user,
      referralCount,
      cart: cart || { items: [], totalPrice: 0 },
      wishlist: wishlist || { items: [] }
    });
  } catch (err) {
    console.error('Error fetching user details:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, number, isVerified, status } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { name, email, number, isVerified, status },
      { new: true, runValidators: true }
    )
    .populate({
      path: 'referredBy',
      select: 'name email number referralCode'
    })
    .select('-otp -otpExpiresAt');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ 
      message: 'User updated successfully', 
      user: updatedUser 
    });
  } catch (err) {
    console.error('Error updating user:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Search Users (Admin)
exports.searchUsers = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.trim() === "") {
      return res.status(400).json({ message: "Search query is required" });
    }

    const users = await User.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { number: { $regex: query, $options: "i" } }
      ]
    })
    .populate({
      path: 'referredBy',
      select: 'name email number referralCode'
    })
    .select("-otp -otpExpiresAt");

    res.status(200).json({ count: users.length, users });
  } catch (err) {
    console.error("Error searching users:", err);
    res.status(500).json({ message: "Server error" });
  }
};


const User = require('../../../Models/User/Auth/authModel');
const DeletedUser = require('../../../Models/User/DeletedUser/deletedUserModel'); 
const mongoose = require('mongoose');
const CoinSettings = require('../../../Models/Admin/CoinSetting/coinSettingModel')

// GET PROFILE
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-otp -otpExpiresAt');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (err) {
    console.error('Error fetching profile:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// UPDATE PROFILE (Name, Email, Number)
exports.updateProfile = async (req, res) => {
  try {
    const { name, email, number } = req.body;

    // Check if email or number already exists in User (excluding current user)
    const conflict = await User.findOne({
      _id: { $ne: req.user.id },
      $or: [{ email }, { number }]
    });

    if (conflict) {
      return res.status(400).json({ message: 'Email or number already exists' });
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { name, email, number },
      { new: true, runValidators: true }
    ).select('-otp -otpExpiresAt');

    res.status(200).json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({ message: 'Server error' });
  }
};


// APPLY REFERRAL CODE (One-Time)
exports.applyReferralCode = async (req, res) => {
  try {
    const { referralCode } = req.body;
    if (!referralCode) {
      return res.status(400).json({ message: 'Referral code is required' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if this user is reclaiming an old account
    const reclaimCheck = await DeletedUser.findOne({
      $or: [{ email: user.email }, { number: user.number }]
    });

    if (reclaimCheck) {
      return res.status(400).json({
        message: 'Referral benefits are not available for reclaimed accounts'
      });
    }

    // Prevent multiple use
    if (user.referredBy) {
      return res.status(400).json({ message: 'Referral code already applied' });
    }

    // Find referrer
    const referrer = await User.findOne({ referralCode });
    if (!referrer) {
      return res.status(400).json({ message: 'Invalid referral code' });
    }

    // Prevent self-referral
    if (referrer._id.toString() === user._id.toString()) {
      return res.status(400).json({ message: 'You cannot refer yourself' });
    }

    // Apply referral
    user.referredBy = referrer._id;
    await user.save();

    const coinSettings = await CoinSettings.findOne();
    const referralBonus = coinSettings?.referralBonus || 0;

    referrer.coins = (referrer.coins || 0) + referralBonus; 
    await referrer.save();

    res.status(200).json({ message: 'Referral applied successfully' });
  } catch (err) {
    console.error('Error applying referral code:', err);
    res.status(500).json({ message: 'Server error' });
  }
};


// DELETE PROFILE (Minimal Data Storage)
exports.deleteProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find the user
    const user = await User.findById(userId).select('email number referralCode referredBy');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Save only the necessary data for reclaim checks
    await DeletedUser.create({
      email: user.email,
      number: user.number,
      referralCode: user.referralCode,
      referredBy: user.referredBy,
      deletedAt: new Date()
    });

    // Delete user from main collection
    await User.findByIdAndDelete(userId);

    res.status(200).json({ message: 'Profile deleted successfully' });

  } catch (err) {
    console.error('Delete profile error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

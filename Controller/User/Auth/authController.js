const User = require('../../../Models/User/Auth/authModel');
const jwt = require('jsonwebtoken');

// Generate 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const generateToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '30d' }
  );
};

const sendOtp = (number, otp) => {
  console.log(`OTP for ${number}: ${otp}`); // Dev only
};

const loginOrRegister = async (req, res) => {
  try {
    const { name, number } = req.body;

    if (!number || !name) {
      return res.status(400).json({
        success: false,
        message: 'Name and phone number are required'
      });
    }

    let user = await User.findOne({ number });

    if (!user) {
      // New User Registration
      user = new User({ name, number });
    } else {
      // Existing User → Update name if different
      if (user.name !== name) {
        user.name = name;
      }
    }

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
    await user.save();

    sendOtp(number, otp);

    res.status(200).json({
      success: true,
      message: user.isVerified
        ? 'Login OTP sent'
        : 'Registration OTP sent',
      userId: user._id,
      otp // Remove in production
    });

  } catch (err) {
    console.error('Login/Register error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// 📌 VERIFY OTP
const verifyOtp = async (req, res) => {
  try {
    const { userId, otp } = req.body;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.otp !== otp || new Date() > user.otpExpiresAt) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpiresAt = null;
    await user.save();

    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      message: 'Number verified successfully',
      user: {
        _id: user._id,
        name: user.name,
        number: user.number,
        isVerified: user.isVerified
      },
      token
    });

  } catch (err) {
    console.error('OTP verification error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error during verification'
    });
  }
};

module.exports = { loginOrRegister, verifyOtp };

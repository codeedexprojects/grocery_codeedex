const User = require('../../../Models/User/Auth/authModel');
const jwt = require('jsonwebtoken');

// Generate 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '30d' }
  );
};

// Mock OTP sender (replace with SMS service like Twilio)
const sendOtp = (number, otp) => {
  console.log(`OTP for ${number}: ${otp}`); // Remove in production
};

// 1. PHONE-ONLY REGISTRATION
const register = async (req, res) => {
  try {
    const { number } = req.body;

    if (!number) {
      return res.status(400).json({ 
        success: false, 
        message: 'Phone number is required' 
      });
    }

    // Check if number already verified
    const existingUser = await User.findOne({ number, isVerified: true });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'Number already registered. Please login.' 
      });
    }

    // Create or update unverified user
    const otp = generateOTP();
    const user = await User.findOneAndUpdate(
      { number },
      { 
        otp,
        otpExpiresAt: new Date(Date.now() + 5 * 60 * 1000) // 5 mins expiry
      },
      { upsert: true, new: true }
    );

    sendOtp(number, otp);

    res.status(200).json({
      success: true,
      message: 'OTP sent',
      userId: user._id,
      otp: otp,
    });

  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during registration' 
    });
  }
};

// 2. VERIFY OTP (SAME FOR REGISTER/LOGIN)
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

    // Validate OTP
    if (user.otp !== otp || new Date() > user.otpExpiresAt) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid or expired OTP' 
      });
    }

    // Mark verified and clear OTP
    user.isVerified = true;
    user.otp = null;
    user.otpExpiresAt = null;
    await user.save();

    // Generate JWT token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Number verified successfully',
      user: {
        _id: user._id,
        number: user.number,
        isVerified: user.isVerified
      },
      token // Include the JWT token
    });

  } catch (err) {
    console.error('OTP verification error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during verification' 
    });
  }
};

// 3. LOGIN (SAME AS REGISTER FLOW BUT CHECKS VERIFICATION)
const login = async (req, res) => {
  try {
    const { number } = req.body;

    const user = await User.findOne({ number });
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Number not found. Please register.' 
      });
    }

    // Send OTP (same as registration flow)
    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);
    await user.save();

    sendOtp(number, otp);

    res.status(200).json({
      success: true,
      message: 'Login OTP sent',
      userId: user._id,
      otp: otp
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during login' 
    });
  }
};

module.exports = { register, verifyOtp, login };
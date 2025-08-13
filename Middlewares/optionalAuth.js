const jwt = require('jsonwebtoken');
const User = require('../Models/User/Auth/authModel');

const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(); 
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return next();
  }

  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decodedToken._id);
    
    if (user) {
      req.user = user; 
    }
    
    next();
  } catch (err) {
    next();
  }
};

module.exports = optionalAuth;
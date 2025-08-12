const jwt = require('jsonwebtoken');
const User = require('../Models/User/Auth/authModel');

const verifyUserToken = (allowedRoles = []) => {
  return async (req, res, next) => {
    const authHeader = req.headers['authorization'];

    if(!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(403).json({message:"Access denied. No token provided"})
    }
    
    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(403).json({ message: "Access denied. No token provided." });
    }

    try {
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
      
      // Verify user exists in database
      const user = await User.findById(decodedToken._id);
      if (!user) {
        return res.status(401).json({ message: "User not found." });
      }

      if (allowedRoles.length && !allowedRoles.includes(decodedToken.role)) {
        return res.status(401).json({ message: "Unauthorized. Access denied." });
      }

      // Attach full user document to request
      req.user = user;
      next();
    } catch (err) {
      return res.status(401).json({ message: "Invalid or expired token." });
    }
  };
};

module.exports = verifyUserToken;
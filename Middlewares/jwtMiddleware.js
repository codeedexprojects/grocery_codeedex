const jwt = require('jsonwebtoken');
const User = require('../Models/User/Auth/authModel');
const Admin = require('../Models/Admin/Auth/authModel')

const verifyToken = (allowedRoles = ["user", "admin", "subadmin"]) => {
  return async (req, res, next) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(403).json({ message: "Access denied. No token provided" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(403).json({ message: "Access denied. No token provided." });
    }

    try {
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
              
      // Role restriction check
      if (allowedRoles.length && !allowedRoles.includes(decodedToken.role)) {
        return res.status(401).json({ message: "Unauthorized. Access denied." });
      }
      
      let account;
      if (decodedToken.role === "user") {
        account = await User.findById(decodedToken._id);
        if (!account) {
          return res.status(401).json({ message: "User not found." });          
        }
        req.user = account;
      } else if (["admin", "subadmin"].includes(decodedToken.role)) {
        
        account = await Admin.findById(decodedToken.id);
        if (!account) {            
          return res.status(401).json({ message: "Admin not found." });
        }
        req.admin = account;
      } else {
        return res.status(401).json({ message: "Role not recognized." });
      }

      next();
    } catch (err) {
      return res.status(401).json({ message: "Invalid or expired token." });
    }
  };
};


module.exports = verifyToken;

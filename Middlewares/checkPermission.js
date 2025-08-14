module.exports = (requiredPermission) => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(403).json({ message: 'Not authenticated' });
    }

    if (req.admin.role === 'admin') {
      return next(); 
    }

    if (!req.admin.permissions.includes(requiredPermission)) {
      return res.status(403).json({ message: 'Permission denied' });
    }

    next();
  };
};

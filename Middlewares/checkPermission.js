module.exports = function(requiredPermission) {
  return (req, res, next) => {
    const { role, permissions } = req.admin; 
    if (role === 'admin') return next();

    if (!permissions.includes(requiredPermission) && !permissions.includes('*')) {
      return res.status(403).json({ message: 'Permission denied' });
    }

    next();
  };
};

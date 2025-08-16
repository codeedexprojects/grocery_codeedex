const Admin = require('../../../Models/Admin/Auth/authModel');

// Create subadmin
exports.createSubadmin = async (req, res) => {
  try {
    const { name, email, password, permissions } = req.body;

    // Check if email already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const subadmin = new Admin({
      name,
      email,
      password,
      role: 'subadmin',
      permissions
    });

    await subadmin.save();
    res.status(201).json({ message: 'Subadmin created successfully', subadmin });

  } catch (error) {
    console.error('Error creating subadmin:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.updateSubadmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, permissions } = req.body;

    // Find subadmin
    const subadmin = await Admin.findById(id);
    if (!subadmin || subadmin.role !== 'subadmin') {
      return res.status(404).json({ message: 'Subadmin not found' });
    }

    // Update fields only if provided
    if (name) subadmin.name = name;
    if (email) subadmin.email = email;
    if (permissions) subadmin.permissions = permissions;

    // If password is provided, hash it
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      subadmin.password = hashedPassword;
    }

    // Save changes
    await subadmin.save();

    res.status(200).json({
      message: 'Subadmin updated successfully',
      subadmin: { ...subadmin.toObject(), password: undefined }
    });
  } catch (err) {
    console.error('Error updating subadmin:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
exports.getSubAdmins = async (req, res) => {
  try {
    const admins = await Admin.find({role:"subadmin"}).select('-password');
    res.status(200).json({ admins });
  } catch (err) {
    console.error('Error fetching admins:', err);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.deleteSubadmin = async (req, res) => {
  try {
    const { id } = req.params;

    const admin = await Admin.findById(id);
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    await Admin.findByIdAndDelete(id);
    res.status(200).json({ message: 'Subadmin deleted successfully' });

  } catch (err) {
    console.error('Error deleting subadmin:', err);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.searchSubadmins = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({ message: "Search query is required" });
    }

    // Search only subadmins
    const subadmins = await Admin.find({
      role: "subadmin",
      $or: [
        { name: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } }
      ]
    }).select("-password");

    res.status(200).json({ results: subadmins });
  } catch (err) {
    console.error("Error searching subadmins:", err);
    res.status(500).json({ message: "Server error" });
  }
};

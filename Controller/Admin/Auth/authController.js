const Admin = require('../../../Models/Admin/Auth/authModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const registerAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const adminExists = await Admin.findOne({ email });
    if (adminExists) {
      return res.status(400).json({ message: 'Admin already exists' });
    }
    const admin = new Admin({ name, email, password });
    await admin.save();
    res.status(201).json({ message: 'Admin registered successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: admin._id, email: admin.email, role: admin.role, permissions: admin.permissions },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // base response
    const responseData = {
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role, // always include role
      }
    };

    // include permissions only if subadmin
    if (admin.role === 'subadmin') {
      responseData.admin.permissions = admin.permissions;
    }

    res.json(responseData);

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = { registerAdmin, loginAdmin };
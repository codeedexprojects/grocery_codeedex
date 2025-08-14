const Address = require('../../../Models/User/Address/addressModel');

// Add new address
exports.addAddress = async (req, res) => {
  try {
    const { name, phone, house, street, city, state, postalCode, country, isDefault } = req.body;

    if (isDefault) {
      // unset previous default addresses
      await Address.updateMany({ user: req.user._id }, { isDefault: false });
    }

    const address = await Address.create({
      user: req.user._id,
      name, phone, house, street, city, state, postalCode, country, isDefault
    });

    res.status(201).json({ success: true, address });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get all addresses of user
exports.getAddresses = async (req, res) => {
  try {
    const addresses = await Address.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, addresses });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update address
exports.updateAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (updateData.isDefault) {
      await Address.updateMany({ user: req.user._id }, { isDefault: false });
    }

    const address = await Address.findOneAndUpdate(
      { _id: id, user: req.user._id },
      updateData,
      { new: true }
    );

    if (!address) return res.status(404).json({ success: false, message: 'Address not found' });

    res.json({ success: true, address });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Delete address
exports.deleteAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const address = await Address.findOneAndDelete({ _id: id, user: req.user._id });
    if (!address) return res.status(404).json({ success: false, message: 'Address not found' });

    res.json({ success: true, message: 'Address deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

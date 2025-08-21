const DeliveryCharge = require('../../../Models/Admin/DeliveryCharge/deliveryChargeModel');

// Add delivery charge rule
exports.addDeliveryCharge = async (req, res) => {
  try {
    const { minAmount, maxAmount, charge } = req.body;

    if (minAmount == null || maxAmount == null || charge == null) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const deliveryCharge = await DeliveryCharge.create({ minAmount, maxAmount, charge });

    res.status(201).json({
      success: true,
      message: "Delivery charge rule added successfully",
      data: deliveryCharge
    });
  } catch (error) {
    console.error("Add Delivery Charge Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get all delivery charges
exports.getDeliveryCharges = async (req, res) => {
  try {
    const charges = await DeliveryCharge.find().sort({ minAmount: 1 });
    res.status(200).json({ success: true, data: charges });
  } catch (error) {
    console.error("Get Delivery Charges Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Update a delivery charge rule
exports.updateDeliveryCharge = async (req, res) => {
  try {
    const { id } = req.params;
    const { minAmount, maxAmount, charge } = req.body;

    const updated = await DeliveryCharge.findByIdAndUpdate(
      id,
      { minAmount, maxAmount, charge },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: "Rule not found" });
    }

    res.status(200).json({ success: true, message: "Rule updated successfully", data: updated });
  } catch (error) {
    console.error("Update Delivery Charge Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Delete a delivery charge rule
exports.deleteDeliveryCharge = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await DeliveryCharge.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Rule not found" });
    }

    res.status(200).json({ success: true, message: "Rule deleted successfully" });
  } catch (error) {
    console.error("Delete Delivery Charge Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get delivery charge for a given order amount
exports.getChargeByAmount = async (req, res) => {
  try {
    const { amount } = req.query;

    if (!amount) {
      return res.status(400).json({ success: false, message: "Order amount is required" });
    }

    const rule = await DeliveryCharge.findOne({
      minAmount: { $lte: amount },
      maxAmount: { $gte: amount }
    });

    if (!rule) {
      return res.status(200).json({ success: true, charge: 0, message: "No delivery charge applicable" });
    }

    res.status(200).json({ success: true, charge: rule.charge });
  } catch (error) {
    console.error("Get Charge By Amount Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

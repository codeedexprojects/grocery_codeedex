const Coupon = require("../../../Models/Admin/Coupon/couponModel");

// Create Coupon
exports.createCoupon = async (req, res) => {
    try {
        const exists = await Coupon.findOne({ code: req.body.code });
        if (exists) return res.status(400).json({ message: "Coupon code already exists" });

        const coupon = await Coupon.create(req.body);
        res.status(201).json({ message: "Coupon created successfully", coupon });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get All Coupons
exports.getAllCoupons = async (req, res) => {
    try {
        const coupons = await Coupon.find()
            .populate("applicableCategories", "name")
            .populate("applicableProducts", "name")
            .sort({ createdAt: -1 });
        res.json(coupons);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Update Coupon
exports.updateCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!coupon) return res.status(404).json({ message: "Coupon not found" });

        res.json({ message: "Coupon updated successfully", coupon });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Delete Coupon
exports.deleteCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findByIdAndDelete(req.params.id);
        if (!coupon) return res.status(404).json({ message: "Coupon not found" });

        res.json({ message: "Coupon deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

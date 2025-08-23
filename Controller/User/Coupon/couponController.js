const Coupon = require("../../../Models/Admin/Coupon/couponModel");


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
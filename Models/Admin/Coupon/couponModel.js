const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true, trim: true }, // Coupon Code
    status: { type: String, enum: ["active", "inactive"], default: "active" }, // Status
    discountType: { type: String, enum: ["percentage", "fixed"], required: true }, // Discount Type
    discountValue: { type: Number, required: true }, // Discount Value
    usageLimit: { type: Number, default: 0 }, // 0 = unlimited
    usedCount: { type: Number, default: 0 }, // How many times it was used
    expiryDate: { type: Date, required: true }, // Expiry Date
    applicationType: { type: String, enum: ["category", "product"], required: true }, // Category or Product
    applicableCategories: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }], // For category type
    applicableProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }], // For product type
}, { timestamps: true });

module.exports = mongoose.model("Coupon", couponSchema);

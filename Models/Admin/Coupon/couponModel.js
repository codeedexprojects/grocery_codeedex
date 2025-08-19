const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true, trim: true }, 
    status: { type: String, enum: ["active", "inactive"], default: "active" }, 
    discountType: { type: String, enum: ["percentage", "fixed"], required: true }, 
    discountValue: { type: Number, required: true }, 
    usageLimit: { type: Number, default: 0 }, 
    usedCount: { type: Number, default: 0 }, 
    expiryDate: { type: Date, required: true }, 
    applicationType: { type: String, enum: ["category", "product"], required: true }, 
    applicableCategories: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }], 
    applicableProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
}, { timestamps: true });

module.exports = mongoose.model("Coupon", couponSchema);

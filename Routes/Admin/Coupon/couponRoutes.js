const express = require("express");
const router = express.Router();
const couponController = require("../../../Controller/Admin/Coupon/couponController");

router.post("/", couponController.createCoupon);
router.get("/", couponController.getAllCoupons);
router.patch("/:id", couponController.updateCoupon);
router.delete("/:id", couponController.deleteCoupon);

module.exports = router;

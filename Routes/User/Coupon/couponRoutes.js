const express = require("express");
const router = express.Router();
const couponController = require("../../../Controller/User/Coupon/couponController");

router.get("/get", couponController.getAllCoupons);


module.exports = router;

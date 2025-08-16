const express = require("express");
const router = express.Router();
const couponController = require("../../../Controller/Admin/Coupon/couponController");
const checkPermission = require('../../../Middlewares/checkPermission')
const adminLogger = require('../../../Middlewares/adminLogger')
const verifyAdmin = require('../../../Middlewares/jwtMiddleware')


router.post("/", verifyAdmin(['admin','subadmin']), checkPermission("create_coupon"), adminLogger('Coupon', 'create'), couponController.createCoupon);
router.get("/", couponController.getAllCoupons);
router.patch("/:id", verifyAdmin(['admin', 'subadmin']), checkPermission("update_coupon"), adminLogger('Coupon', 'update'), couponController.updateCoupon);
router.delete("/:id", couponController.deleteCoupon);
router.get('/search', couponController.searchCoupons)

module.exports = router;

// routes/profileRoutes.js
const express = require('express');
const router = express.Router();
const profileController = require('../../../Controller/User/Profile/profileController');
const verifyToken = require('../../../Middlewares/jwtMiddleware')


// GET profile
router.get('/', verifyToken(['user']), profileController.getProfile);

// UPDATE profile
router.patch('/', verifyToken(['user']), profileController.updateProfile);

// APPLY referral code
router.post('/referral', verifyToken(['user']), profileController.applyReferralCode);

// DELETE profile
router.delete('/', verifyToken(['user']), profileController.deleteProfile);

module.exports = router;

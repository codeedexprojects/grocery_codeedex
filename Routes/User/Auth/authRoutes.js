const express = require('express');
const router = express.Router();
const authController = require('../../../Controller/User/Auth/authController');

router.post('/login', authController.loginOrRegister);

router.post('/verify-otp', authController.verifyOtp);

module.exports = router;
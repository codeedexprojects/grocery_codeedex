const express = require('express');
const router = express.Router();
const authController = require('../../../Controller/User/Auth/authController');

// POST /register
router.post('/register', authController.register);

// POST /login
router.post('/login', authController.login);

// POST /verify-otp
router.post('/verify-otp', authController.verifyOtp);

module.exports = router;

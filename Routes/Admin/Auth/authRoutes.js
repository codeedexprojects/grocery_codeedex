const express = require('express');
const router = express.Router();
const { registerAdmin, loginAdmin } = require('../../../Controller/Admin/Auth/authController');

router.post('/register', registerAdmin);

router.post('/login', loginAdmin);

module.exports = router;

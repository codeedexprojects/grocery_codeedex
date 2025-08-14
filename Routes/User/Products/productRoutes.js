const express = require('express');
const router = express.Router();
const path = require('path');
const {
  getAllProducts,
  getProductById,
  getProductsByMainCategory,
} = require('../../../Controller/User/Products/productController');
const optionalAuth = require('../../../Middlewares/optionalAuth'); // Add this line

router.get('/get', optionalAuth, getAllProducts);
router.get('/get/:id', optionalAuth, getProductById);
router.get('/get/main/:mainCategoryId', optionalAuth, getProductsByMainCategory);

module.exports = router;
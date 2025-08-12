const express = require('express');
const router = express.Router();
const path = require('path');
const {
  getAllProducts,
  getProductById,
  getProductsByMainCategory,
} = require('../../../Controller/User/Products/productController');

router.get('/get', getAllProducts);
router.get('/get/:id', getProductById);
router.get('/get/main/:mainCategoryId', getProductsByMainCategory);

module.exports = router;

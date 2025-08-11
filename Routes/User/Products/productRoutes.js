const express = require('express');
const router = express.Router();
const path = require('path');
const {
  getAllProducts,
  getProductById,
} = require('../../../Controller/User/Products/productController');

router.get('/get', getAllProducts);
router.get('/get/:id', getProductById);

module.exports = router;

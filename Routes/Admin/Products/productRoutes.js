const express = require('express');
const router = express.Router();
const path = require('path');
const {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct
} = require('../../../Controller/Admin/Products/productController');
const { upload } = require('../../../Middlewares/multerMiddleware'); 


router.post('/create', upload.array('images', 5), createProduct);
router.get('/get', getAllProducts);
router.get('/get/:id', getProductById);
router.patch('/update/:id', upload.array('images', 5), updateProduct);
router.delete('/delete/:id', deleteProduct);

module.exports = router;

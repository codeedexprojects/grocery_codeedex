const express = require('express');
const router = express.Router();
const path = require('path');
const {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  searchAndFilterProducts
} = require('../../../Controller/Admin/Products/productController');
const { upload } = require('../../../Middlewares/multerMiddleware'); 
const cloudinaryMapper = require('../../../Middlewares/cloudinaryMapper')



router.post('/create', upload.array('images', 5), cloudinaryMapper, createProduct);
router.get('/get', getAllProducts);
router.get('/get/:id', getProductById);
router.patch('/update/:id', upload.array('images', 5), cloudinaryMapper, updateProduct);
router.delete('/delete/:id', deleteProduct);
router.get('/filter', searchAndFilterProducts);



module.exports = router;

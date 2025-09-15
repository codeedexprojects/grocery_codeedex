const express = require('express');
const router = express.Router();
const {createCategory,getCategories,getCategoryById,updateCategory,deleteCategory, searchMainCategories
} = require('../../../Controller/Admin/MainCategories/mainCategoryController');
const { upload } = require('../../../Middlewares/multerMiddleware'); 
const cloudinaryMapper = require('../../../Middlewares/cloudinaryMapper')


router.post('/create', upload.single('image'), cloudinaryMapper, createCategory);

router.get('/get', getCategories);

router.get('/get/:id', getCategoryById);

router.patch('/update/:id', upload.single('image'), cloudinaryMapper, updateCategory);

router.delete('/delete/:id', deleteCategory);

router.get('/search', searchMainCategories);


module.exports = router;
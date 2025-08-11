const express = require('express');
const router = express.Router();
const subcategoryController = require('../../../Controller/Admin/SubCategory/subCategoryController');
const {upload} = require('../../../Middlewares/multerMiddleware');

router.post('/create', upload.single('image'), subcategoryController.createSubcategory);
router.get('/get', subcategoryController.getSubcategories);
router.get('/get/category/:categoryId', subcategoryController.getSubcategoriesByCategory);
router.get('/get/:id', subcategoryController.getSubcategoryById);
router.patch('/update/:id', upload.single('image'), subcategoryController.updateSubcategory);
router.delete('/delete/:id', subcategoryController.deleteSubcategory);

module.exports = router;
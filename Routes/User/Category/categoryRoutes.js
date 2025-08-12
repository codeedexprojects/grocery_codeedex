const express = require('express');
const router = express.Router();
const categoryController = require('../../../Controller/User/Categories/categoriesController');

router.get('/get', categoryController.getAllCategoriesWithSubcategories);

router.get('/main-category/:mainCategoryId', categoryController.getCategoriesByMainCategory);

module.exports = router;

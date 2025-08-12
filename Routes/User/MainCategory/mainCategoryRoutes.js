const express = require('express');
const router = express.Router();
const {getCategories} = require('../../../Controller/User/MainCategories/mainCategoryController');


router.get('/get', getCategories);

module.exports = router;
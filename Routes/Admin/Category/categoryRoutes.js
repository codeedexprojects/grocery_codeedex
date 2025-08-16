const express = require('express');
const router = express.Router();
const {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  searchCategories
} = require('../../../Controller/Admin/Category/categoryController');
const { upload } = require('../../../Middlewares/multerMiddleware');

router.post('/create', upload.single('image'), createCategory);
router.get('/get', getCategories);
router.get('/get/:id', getCategoryById);
router.patch('/update/:id', upload.single('image'), updateCategory);
router.delete('/delete/:id', deleteCategory);
router.get('/search', searchCategories);


module.exports = router;

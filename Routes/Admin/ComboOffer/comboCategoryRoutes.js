const express = require("express");
const router = express.Router();
const categoryController = require("../../../Controller/Admin/ComboOffer/comboCategoryController");

// Create category
router.post("/create", categoryController.createCategory);

// Get all categories
router.get("/get", categoryController.getCategories);

// Get single category
router.get("/get/:id", categoryController.getCategoryById);

// Update category
router.put("/update/:id", categoryController.updateCategory);

// Delete category
router.delete("/delete/:id", categoryController.deleteCategory);

module.exports = router;

const express = require('express');
const router = express.Router();
const userController = require('../../../Controller/Admin/UserManagement/userManagementController');

router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.patch('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

module.exports = router;

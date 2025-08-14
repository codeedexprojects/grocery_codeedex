const express = require('express');
const router = express.Router();
const verifyToken = require('../../../Middlewares/jwtMiddleware');
const addressController = require('../../../Controller/User/Address/addressController');

// All routes require user authentication
router.use(verifyToken(['user']));

router.post('/', addressController.addAddress);
router.get('/', addressController.getAddresses);
router.patch('/:id', addressController.updateAddress);
router.delete('/:id', addressController.deleteAddress);

module.exports = router;

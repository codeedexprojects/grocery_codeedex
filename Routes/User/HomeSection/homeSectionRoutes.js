const express = require('express');
const router = express.Router();
const {
  getHomeSections,
  getHomeSectionById,
} = require('../../../Controller/User/HomeSection/homeSectionController');
const optionalAuth = require('../../../Middlewares/optionalAuth'); // Add this line

router.get('/get',optionalAuth, getHomeSections);

router.get('/get/:id',optionalAuth, getHomeSectionById);

module.exports = router;
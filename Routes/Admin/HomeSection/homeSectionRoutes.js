const express = require('express');
const router = express.Router();
const {
  createHomeSection,
  getHomeSections,
  getHomeSectionById,
  updateHomeSection,
  deleteHomeSection
} = require('../../../Controller/Admin/HomeSection/homeSectionController');


router.post('/create', createHomeSection);

router.get('/get', getHomeSections);

router.get('/get/:id', getHomeSectionById);

router.patch('/update/:id', updateHomeSection);

router.delete('/delete/:id', deleteHomeSection);

module.exports = router;

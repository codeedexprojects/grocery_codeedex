// routes/admin/subadminRoutes.js
const express = require('express');
const router = express.Router();
const subadminController = require('../../../Controller/Admin/SubAdminManagement/subAdminManagementController');

// Middlewares (optional)
// const { verifyAdmin } = require('../../middlewares/authMiddleware');


// 📌 Create Subadmin
router.post(
  '/',
  // verifyAdmin,
  subadminController.createSubadmin
);

// 📌 Update Subadmin 
router.patch(
  '/:id',
  // verifyAdmin,
  subadminController.updateSubadmin
);

// 📌 Get All Subadmins
router.get(
  '/',
  // verifyAdmin,
  subadminController.getSubAdmins
);

// 📌 Delete Subadmin
router.delete(
  '/:id',
  // verifyAdmin,
  subadminController.deleteSubadmin
);

module.exports = router;

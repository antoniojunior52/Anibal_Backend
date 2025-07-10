// routes/userRoutes.js
const express = require('express');
const {
  getUsers,
  getUserProfile,
  updateUserProfile,
  changePassword,
  updateUserPermissions,
  deleteUser,
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Admin routes
router.route('/')
  .get(protect, authorize('admin'), getUsers);

router.route('/:id')
  .put(protect, authorize('admin'), updateUserPermissions)
  .delete(protect, authorize('admin'), deleteUser);

// User profile routes
router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

router.put('/change-password', protect, changePassword);

module.exports = router;

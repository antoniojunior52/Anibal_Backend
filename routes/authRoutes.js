// routes/authRoutes.js
const express = require('express');
const {
  registerUserByAdmin,
  publicRegisterUser,
  loginUser,
  forgotPassword,
  resetPassword,
} = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.post('/register-by-admin', protect, authorize('admin'), registerUserByAdmin);
router.post('/public-register', publicRegisterUser);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);

module.exports = router;

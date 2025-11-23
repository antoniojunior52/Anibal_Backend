// routes/authRoutes.js
const express = require('express');
const {
  registerUserByAdmin,
  publicRegisterUser,
  loginUser,
  forgotPassword,
  resetPassword,
  verifyEmail,
  //resendCode,
  checkEmail, 
} = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.post('/register-by-admin', protect, authorize('admin'), registerUserByAdmin);
router.post('/public-register', publicRegisterUser);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);

router.post('/verify-email', verifyEmail);
//router.post('/resend-code', resendCode);

// *** 2. ADICIONA A NOVA ROTA ***
// Esta rota pode ser pública, pois não expõe dados sensíveis
router.post('/check-email', checkEmail);

module.exports = router;
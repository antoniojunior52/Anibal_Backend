const express = require('express');
const multer = require('multer'); // <--- 1. Importar Multer
const {
  getUsers,
  getUserProfile,
  updateUserProfile,
  changePassword,
  updateUserPermissions,
  deleteUser,
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');
const nsfwCheck = require('../middleware/nsfwCheck'); // <--- 2. Importar seu filtro

const router = express.Router();

// --- CONFIGURAÇÃO DO MULTER ---
// Salva na memória temporária para a IA ler rápido
const storage = multer.memoryStorage(); 
const upload = multer({ storage: storage });

// Admin routes
// User profile routes
router.route('/profile')
  .get(protect, getUserProfile)
  .put(
    protect, 
    upload.single('avatar'), // <--- 3. Recebe o arquivo (nome do campo: 'avatar')
    nsfwCheck,               // <--- 4. A IA verifica se é porno
    updateUserProfile        // <--- 5. Se passar, chega no seu controller
  );

router.put('/change-password', protect, changePassword);  

router.route('/')
  .get(protect, authorize('admin'), getUsers);

router.route('/:id')
  .put(protect, authorize('admin'), updateUserPermissions)
  .delete(protect, authorize('admin'), deleteUser);

module.exports = router;
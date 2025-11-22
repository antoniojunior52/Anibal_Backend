const express = require('express');
const multer = require('multer'); // Importar Multer direto
const {
  getTeam,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
} = require('../controllers/teamController');
const { protect, authorize } = require('../middleware/auth');
const nsfwCheck = require('../middleware/nsfwCheck'); // Importar Filtro

const router = express.Router();

// Configurar Multer para Memória
const upload = multer({ storage: multer.memoryStorage() });

router.route('/')
  .get(getTeam)
  .post(
    protect, 
    authorize('admin', 'secretaria'), 
    upload.single('file'), // Pega arquivo
    nsfwCheck,             // Verifica IA
    createTeamMember       // Salva
  );

router.route('/:id')
  .put(
    protect, 
    authorize('admin', 'secretaria'), 
    upload.single('file'), 
    nsfwCheck,
    updateTeamMember
  )
  .delete(protect, authorize('admin', 'secretaria'), deleteTeamMember);

module.exports = router;
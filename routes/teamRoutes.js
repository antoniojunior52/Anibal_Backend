// routes/teamRoutes.js
const express = require('express');
const {
  getTeam,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
} = require('../controllers/teamController');
const { protect, authorize } = require('../middleware/auth');
const { upload } = require('../controllers/fileController');

const router = express.Router();

router.route('/')
  .get(getTeam)
  .post(protect, authorize('admin', 'secretaria'), upload.single('file'), createTeamMember);

router.route('/:id')
  .put(protect, authorize('admin', 'secretaria'), upload.single('file'), updateTeamMember)
  .delete(protect, authorize('admin', 'secretaria'), deleteTeamMember);

module.exports = router;
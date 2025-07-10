// routes/teamRoutes.js
const express = require('express');
const {
  getTeam,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
} = require('../controllers/teamController');
const { protect, authorize } = require('../middleware/auth');
const { upload } = require('../controllers/fileController'); // Multer middleware

const router = express.Router();

router.route('/')
  .get(getTeam)
  .post(protect, authorize('admin'), upload, createTeamMember); // Only admin can manage team

router.route('/:id')
  .put(protect, authorize('admin'), upload, updateTeamMember)
  .delete(protect, authorize('admin'), deleteTeamMember);

module.exports = router;

// routes/scheduleRoutes.js
const express = require('express');
const {
  getSchedules,
  uploadSchedule,
  deleteSchedule,
} = require('../controllers/scheduleController');
const { protect, authorize } = require('../middleware/auth');
const { upload } = require('../controllers/fileController'); // Multer middleware

const router = express.Router();

router.route('/')
  .get(getSchedules)
  .post(protect, authorize('admin', 'secretaria'), upload, uploadSchedule);

router.route('/:className') // Use className as parameter for deletion
  .delete(protect, authorize('admin', 'secretaria'), deleteSchedule);

module.exports = router;

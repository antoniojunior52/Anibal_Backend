// routes/fileRoutes.js
const express = require('express');
const { uploadFile, upload } = require('../controllers/fileController'); // Import upload middleware and controller
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Generic file upload route
router.post('/upload', protect, authorize('admin', 'secretaria'), upload, uploadFile);

module.exports = router;

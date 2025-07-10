// routes/menuRoutes.js
const express = require('express');
const {
  getMenu,
  uploadMenu,
} = require('../controllers/menuController');
const { protect, authorize } = require('../middleware/auth');
const { upload } = require('../controllers/fileController'); // Multer middleware

const router = express.Router();

router.route('/')
  .get(getMenu)
  .post(protect, authorize('admin', 'secretaria'), upload, uploadMenu);

module.exports = router;
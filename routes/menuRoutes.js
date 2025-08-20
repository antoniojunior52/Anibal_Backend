// routes/menuRoutes.js
const express = require('express');
const {
  getMenu,
  uploadMenu,
} = require('../controllers/menuController');
const { protect, authorize } = require('../middleware/auth');
const { upload } = require('../controllers/fileController');

const router = express.Router();

router.route('/')
  .get(getMenu)
  .post(protect, authorize('admin', 'secretaria'), upload.single('file'), uploadMenu);

module.exports = router;

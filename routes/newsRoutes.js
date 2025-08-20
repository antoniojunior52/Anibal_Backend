// routes/newsRoutes.js
const express = require('express');
const {
  getNews,
  createNews,
  updateNews,
  deleteNews,
} = require('../controllers/newsController');
const { protect, authorize } = require('../middleware/auth');
const { upload } = require('../controllers/fileController'); // Multer middleware

const router = express.Router();

router.route('/')
  .get(getNews)
  .post(protect, authorize('admin', 'secretaria'), upload.single('file'), createNews);

router.route('/:id')
  .put(protect, authorize('admin', 'secretaria'), upload.single('file'), updateNews)
  .delete(protect, authorize('admin', 'secretaria'), deleteNews);

module.exports = router;

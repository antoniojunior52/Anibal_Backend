const express = require('express');
const multer = require('multer');
const {
  getNews,
  createNews,
  updateNews,
  deleteNews,
} = require('../controllers/newsController');
const { protect, authorize } = require('../middleware/auth');
const nsfwCheck = require('../middleware/nsfwCheck');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.route('/')
  .get(getNews)
  .post(protect, authorize('admin', 'secretaria'), upload.single('file'), nsfwCheck, createNews);

router.route('/:id')
  .put(protect, authorize('admin', 'secretaria'), upload.single('file'), nsfwCheck, updateNews)
  .delete(protect, authorize('admin', 'secretaria'), deleteNews);

module.exports = router;
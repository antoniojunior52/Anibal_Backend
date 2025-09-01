const express = require('express');
const {
  getGalleryImages,
  uploadGalleryImage,
  deleteGalleryImage,
} = require('../controllers/galleryController');
const { protect, authorize } = require('../middleware/auth');
const { upload } = require('../controllers/fileController');

const router = express.Router();

router.route('/')
  .get(getGalleryImages)
  .post(protect, authorize('admin', 'secretaria'), upload.array('files', 10), uploadGalleryImage);

router.route('/:id')
  .delete(protect, authorize('admin', 'secretaria'), deleteGalleryImage);

module.exports = router;

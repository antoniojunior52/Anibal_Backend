const express = require('express');
const multer = require('multer');
const {
  getGalleryImages,
  uploadGalleryImage,
  deleteGalleryImage,
  deleteGalleryAlbum,
} = require('../controllers/galleryController');
const { protect, authorize } = require('../middleware/auth');
const nsfwCheck = require('../middleware/nsfwCheck');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.route('/')
  .get(getGalleryImages)
  .post(
      protect, 
      authorize('admin', 'secretaria'), 
      upload.array('files', 10), // Array de arquivos
      nsfwCheck,                 // Middleware agora suporta arrays
      uploadGalleryImage
  );

router.route('/album/:albumName')
  .delete(protect, authorize('admin', 'secretaria'), deleteGalleryAlbum);

router.route('/:id')
  .delete(protect, authorize('admin', 'secretaria'), deleteGalleryImage);

module.exports = router;
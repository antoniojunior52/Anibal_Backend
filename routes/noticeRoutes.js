// routes/noticeRoutes.js
const express = require('express');
const {
  getNotices,
  createNotice,
  deleteNotice,
} = require('../controllers/noticeController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .get(getNotices)
  .post(protect, authorize('admin', 'secretaria'), createNotice);

router.route('/:id')
  .delete(protect, authorize('admin'), deleteNotice); // Only admin can delete notices

module.exports = router;

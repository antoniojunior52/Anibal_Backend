// routes/historyRoutes.js
const express = require('express');
const {
  getHistory,
  createHistory,
  updateHistory,
  deleteHistory,
} = require('../controllers/historyController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .get(getHistory)
  .post(protect, authorize('admin'), createHistory); // Only admin can manage history

router.route('/:id')
  .put(protect, authorize('admin'), updateHistory)
  .delete(protect, authorize('admin'), deleteHistory);

module.exports = router;

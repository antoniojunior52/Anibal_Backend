// routes/eventRoutes.js
const express = require('express');
const {
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
} = require('../controllers/eventController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .get(getEvents)
  .post(protect, authorize('admin', 'secretaria'), createEvent);

router.route('/:id')
  .put(protect, authorize('admin', 'secretaria'), updateEvent)
  .delete(protect, authorize('admin', 'secretaria'), deleteEvent);

module.exports = router;

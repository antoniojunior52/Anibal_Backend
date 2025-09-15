// models/Schedule.js
const mongoose = require('mongoose');
const { bool } = require('sharp');

const ScheduleSchema = new mongoose.Schema({
  className: {
    type: String,
    required: true,
  },
  fileUrl: {
    type: String, // Path to the Excel schedule file
    required: true,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
  isActive: {
    type:
     Boolean,
    default: true,
  },
  author: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model('Schedule', ScheduleSchema);

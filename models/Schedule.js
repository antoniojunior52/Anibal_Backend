// models/Schedule.js
const mongoose = require('mongoose');

const ScheduleSchema = new mongoose.Schema({
  className: {
    type: String,
    required: true,
    unique: true, // Each class should have a unique schedule
  },
  fileUrl: {
    type: String, // Path to the Excel schedule file
    required: true,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Schedule', ScheduleSchema);

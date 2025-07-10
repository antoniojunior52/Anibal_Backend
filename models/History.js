// models/History.js
const mongoose = require('mongoose');

const HistorySchema = new mongoose.Schema({
  year: {
    type: Number,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('History', HistorySchema);

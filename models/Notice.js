// models/Notice.js
const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    required: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

const Notice = mongoose.model('Notice', noticeSchema);

module.exports = Notice;
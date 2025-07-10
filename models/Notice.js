// models/Notice.js
const mongoose = require('mongoose');

const NoticeSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    maxlength: 500,
  },
  author: {
    type: String, // Store the name of the user who posted it
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Notice', NoticeSchema);

// models/Menu.js
const mongoose = require('mongoose');

const MenuSchema = new mongoose.Schema({
  fileUrl: {
    type: String, // Path to the menu PDF file
    required: true,
    unique: true, // Only one menu should be active at a time
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Menu', MenuSchema);

// models/Gallery.js
const mongoose = require('mongoose');

const GallerySchema = new mongoose.Schema({
  url: {
    type: String, // Store path to image
    required: true,
  },
  caption: {
    type: String,
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Gallery', GallerySchema);

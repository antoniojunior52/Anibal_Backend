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
  // --- Adicionado o campo para o e-mail do autor ---
  authorEmail: {
    type: String,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  // --- Fim da alteração ---
}, { timestamps: true });

module.exports = mongoose.model('Gallery', GallerySchema);
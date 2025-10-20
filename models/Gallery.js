// models/Gallery.js
const mongoose = require('mongoose');

const GallerySchema = new mongoose.Schema({
  url: {
    type: String, // Caminho para a imagem
    required: true,
  },
  caption: {
    type: String,
    required: true,
  },
  authorEmail: {
    type: String,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  // Campo que associa esta imagem a um álbum específico
  album: { 
    type: String, 
    required: [true, 'O nome do álbum é obrigatório.'],
    trim: true,
  }
}, { timestamps: true });

module.exports = mongoose.model('Gallery', GallerySchema);
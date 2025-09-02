// models/News.js
const mongoose = require('mongoose');

const NewsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  authorEmail: {
    type: String,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  // --- Adicionado o novo campo para o link externo ---
  externalLink: {
    type: String,
    required: false,
  },
  // --- Fim da alteração ---
}, { timestamps: true });

module.exports = mongoose.model('News', NewsSchema);
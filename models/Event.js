// models/Event.js
const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  date: {
    type: Date,
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
  // --- Adicionado o campo para o e-mail do autor ---
  authorEmail: {
    type: String,
    required: true,
  },
  isActive:{
    type: Boolean,
    default: true,
  },
  // --- Fim da alteração ---
}, { timestamps: true });

module.exports = mongoose.model('Event', EventSchema);
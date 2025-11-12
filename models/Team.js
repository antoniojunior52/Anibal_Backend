// models/Team.js
const mongoose = require('mongoose');

const TeamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['Professor(a)', 'Diretora', 'Coordenador(a)', 'Vice-Diretora'],
    required: true,
  },
  subjects: {
    type: [String], 
    default: [],
  },
  bio: {
    type: String,
    required: true,
  },
  photo: {
    type: String, // Store path to photo
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Team', TeamSchema);

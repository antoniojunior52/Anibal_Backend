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
  // O campo createdAt terá um valor padrão do momento da criação.
  // A propriedade 'expires' é a chave para o índice TTL,
  // que irá expirar o documento 24 horas após o valor em createdAt.
  createdAt: {
    type: Date,
    default: Date.now,
    expires: '24h',
  },
});

const Notice = mongoose.model('Notice', noticeSchema);

module.exports = Notice;
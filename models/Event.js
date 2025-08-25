// models/Event.js
const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    // O evento será expirado no momento exato em que a data for alcançada
    // e o documento for mais antigo que 0 segundos em relação a essa data.
    expires: 0,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Event', EventSchema);
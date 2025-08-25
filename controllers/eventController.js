// controllers/eventController.js
const Event = require('../models/Event');

// @desc    Get all events
// @route   GET /api/events
// @access  Public
const getEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 }); // Sort by date ascending
    res.json(events);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

// @desc    Create a new event
// @route   POST /api/events
// @access  Private (Admin/Secretaria)
const createEvent = async (req, res) => {
  const { date, title, description } = req.body;

  try {
    // Converte a string de data do corpo da requisição para um objeto Date
    const eventDate = new Date(date);
    const currentDate = new Date();

    // Validação: checa se a data do evento é anterior à data atual
    if (eventDate < currentDate) {
      return res.status(400).json({ msg: 'A data do evento não pode ser anterior à data atual.' });
    }

    const event = await Event.create({
      date,
      title,
      description,
    });
    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

// @desc    Update an event
// @route   PUT /api/events/:id
// @access  Private (Admin/Secretaria)
const updateEvent = async (req, res) => {
  const { id } = req.params;
  const { date, title, description } = req.body;

  try {
    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({ msg: 'Event not found' });
    }

    // A validação para a data de atualização também pode ser adicionada aqui,
    // se necessário.
    const updatedDate = date || event.date;
    if (new Date(updatedDate) < new Date()) {
      return res.status(400).json({ msg: 'A data do evento não pode ser anterior à data atual.' });
    }

    event.date = updatedDate;
    event.title = title || event.title;
    event.description = description || event.description;

    const updatedEvent = await event.save();
    res.json(updatedEvent);

  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

// @desc    Delete an event
// @route   DELETE /api/events/:id
// @access  Private (Admin/Secretaria)
const deleteEvent = async (req, res) => {
  const { id } = req.params;

  try {
    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({ msg: 'Event not found' });
    }

    await event.deleteOne();
    res.status(200).json({ msg: 'Event removed' });

  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

module.exports = {
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
};
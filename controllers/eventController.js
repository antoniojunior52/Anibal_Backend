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

    event.date = date || event.date;
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

// controllers/eventController.js
const Event = require('../models/Event');

const getEvents = async (req, res) => {
  try {
    const events = await Event.find({ isActive: true }).sort({ date: 1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ msg: 'Erro ao buscar eventos.' });
  }
};

const createEvent = async (req, res) => {
  const { date, title, description } = req.body;

  try {
    const eventDate = new Date(date);
    const currentDate = new Date();

    if (eventDate < currentDate) {
      return res.status(400).json({ msg: 'A data do evento não pode ser anterior à data atual.' });
    }

    // --- Alterado para incluir o e-mail do autor ---
    const newEvent = await Event.create({
      date,
      title,
      description,
      authorEmail: req.user.email, // Salva o e-mail do autor do evento
    });
    // --- Fim da alteração ---
    
    res.status(201).json(newEvent);
  } catch (error) {
    res.status(500).json({ msg: 'Erro ao criar evento.' });
  }
};

const updateEvent = async (req, res) => {
  const { id } = req.params;
  const { date, title, description } = req.body;

  try {
    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({ msg: 'Evento não encontrado.' });
    }

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
    res.status(500).json({ msg: 'Erro ao atualizar evento.' });
  }
};

const deleteEvent = async (req, res) => {
  const { id } = req.params;
  try {
    const event = await Event.findByIdAndUpdate(id, { isActive: false }, { new: true });

    if (!event) {
      return res.status(404).json({ msg: 'Evento não encontrado.' });
    }

    res.json({ msg: 'Evento inativado com sucesso.', event });
  } catch (error) {
    res.status(500).json({ msg: 'Erro ao inativar evento.' });
  }
};

const deactivateExpiredEvents = async () => {
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  try {
    const expiredEvents = await Event.find({
      date: { $lte: yesterday },
      isActive: true,
    });

    if (expiredEvents.length > 0) {
      const idsToDeactivate = expiredEvents.map(event => event._id);
      await Event.updateMany({ _id: { $in: idsToDeactivate } }, { $set: { isActive: false } });
      console.log(`${expiredEvents.length} eventos inativados.`);
    } else {
      console.log('Nenhum evento para inativar hoje.');
    }
  } catch (error) {
    console.error('Erro ao inativar eventos:', error);
  }
};

module.exports = {
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  deactivateExpiredEvents,
};
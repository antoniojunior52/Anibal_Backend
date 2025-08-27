// controllers/historyController.js
const History = require('../models/History');

// @desc    Get all history items
// @route   GET /api/history
// @access  Public
const getHistory = async (req, res) => {
  try {
    const history = await History.find().sort({ year: 1 }); // Sort by year ascending
    res.json(history);
  } catch (error) {
    res.status(500).json({ msg: 'Erro ao buscar itens de história.' });
  }
};

// @desc    Create a new history item
// @route   POST /api/history
// @access  Private (Admin only)
const createHistory = async (req, res) => {
  const { year, title, description } = req.body;

  try {
    const historyItem = await History.create({
      year,
      title,
      description,
    });
    res.status(201).json(historyItem);
  } catch (error) {
    res.status(500).json({ msg: 'Erro ao criar item de história.' });
  }
};

// @desc    Update a history item
// @route   PUT /api/history/:id
// @access  Private (Admin only)
const updateHistory = async (req, res) => {
  const { id } = req.params;
  const { year, title, description } = req.body;

  try {
    const historyItem = await History.findById(id);

    if (!historyItem) {
      return res.status(404).json({ msg: 'Item de história não encontrado.' });
    }

    historyItem.year = year || historyItem.year;
    historyItem.title = title || historyItem.title;
    historyItem.description = description || historyItem.description;

    const updatedHistoryItem = await historyItem.save();
    res.json(updatedHistoryItem);

  } catch (error) {
    res.status(500).json({ msg: 'Erro ao atualizar item de história.' });
  }
};

// @desc    Delete a history item
// @route   DELETE /api/history/:id
// @access  Private (Admin only)
const deleteHistory = async (req, res) => {
  const { id } = req.params;

  try {
    const historyItem = await History.findById(id);

    if (!historyItem) {
      return res.status(404).json({ msg: 'Item de história não encontrado.' });
    }

    await historyItem.deleteOne();
    res.status(200).json({ msg: 'Item de história removido.' });

  } catch (error) {
    res.status(500).json({ msg: 'Erro ao remover item de história.' });
  }
};

module.exports = {
  getHistory,
  createHistory,
  updateHistory,
  deleteHistory,
};

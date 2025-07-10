// controllers/historyController.js
const History = require('../models/History');

// @desc    Get all history items
// @route   GET /api/history
// @access  Public
const getHistory = async (req, res) => {
  try {
    const history = await History.find().sort({ year: 1 }); // Sort by year ascending
    res.json(history);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

// @desc    Create a new history item
// @route   POST /api/history
// @access  Private (Admin only)
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
    res.status(500).json({ msg: error.message });
  }
};

// @desc    Update a history item
// @route   PUT /api/history/:id
// @access  Private (Admin only)
const updateHistory = async (req, res) => {
  const { id } = req.params;
  const { year, title, description } = req.body;

  try {
    const historyItem = await History.findById(id);

    if (!historyItem) {
      return res.status(404).json({ msg: 'History item not found' });
    }

    historyItem.year = year || historyItem.year;
    historyItem.title = title || historyItem.title;
    historyItem.description = description || historyItem.description;

    const updatedHistoryItem = await historyItem.save();
    res.json(updatedHistoryItem);

  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

// @desc    Delete a history item
// @route   DELETE /api/history/:id
// @access  Private (Admin only)
const deleteHistory = async (req, res) => {
  const { id } = req.params;

  try {
    const historyItem = await History.findById(id);

    if (!historyItem) {
      return res.status(404).json({ msg: 'History item not found' });
    }

    await historyItem.deleteOne();
    res.status(200).json({ msg: 'History item removed' });

  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

module.exports = {
  getHistory,
  createHistory,
  updateHistory,
  deleteHistory,
};

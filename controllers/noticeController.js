// controllers/noticeController.js
const Notice = require('../models/Notice');
const User = require('../models/User'); // To get author name

// @desc    Get all notices
// @route   GET /api/notices
// @access  Public
const getNotices = async (req, res) => {
  try {
    const notices = await Notice.find().sort({ createdAt: -1 }); // Sort by newest first
    res.json(notices);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

// @desc    Create a new notice
// @route   POST /api/notices
// @access  Private (Admin/Secretaria)
const createNotice = async (req, res) => {
  const { content } = req.body;

  try {
    const user = await User.findById(req.user._id); // req.user is populated by auth middleware
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    const notice = await Notice.create({
      content,
      author: user.name, // Save the name of the user who created it
    });
    res.status(201).json(notice);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

// @desc    Delete a notice
// @route   DELETE /api/notices/:id
// @access  Private (Admin only)
const deleteNotice = async (req, res) => {
  const { id } = req.params;

  try {
    const notice = await Notice.findById(id);

    if (!notice) {
      return res.status(404).json({ msg: 'Notice not found' });
    }

    await notice.deleteOne();
    res.status(200).json({ msg: 'Notice removed' });

  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

module.exports = {
  getNotices,
  createNotice,
  deleteNotice,
};

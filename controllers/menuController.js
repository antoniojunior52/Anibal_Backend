// controllers/menuController.js
const Menu = require('../models/Menu');
const fs = require('fs');
const path = require('path');

// @desc    Get the current menu PDF URL
// @route   GET /api/menu
// @access  Public
const getMenu = async (req, res) => {
  try {
    // We expect only one menu document, so find the latest one or just one
    const menu = await Menu.findOne().sort({ uploadedAt: -1 });
    if (menu) {
      res.json({ fileUrl: menu.fileUrl });
    } else {
      res.status(404).json({ msg: 'No menu found' });
    }
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

// @desc    Upload/Update the menu PDF
// @route   POST /api/menu
// @access  Private (Admin/Secretaria)
const uploadMenu = async (req, res) => {
  console.log('--- Inside uploadMenu controller ---'); // Added log
  console.log('req.file:', req.file); // Added log to see the file object from Multer
  console.log('req.body:', req.body); // Added log to see the request body (should be empty for file uploads with Multer)

  const fileUrl = req.file ? `/uploads/${req.file.filename}` : null;

  if (!fileUrl) {
    console.error('Error: PDF file is required in menu upload. req.file was not set.'); // More specific log
    return res.status(400).json({ msg: 'PDF file is required' });
  }

  try {
    // Find if a menu already exists
    let menu = await Menu.findOne();

    if (menu) {
      // If old menu exists, delete the old file
      if (menu.fileUrl) {
        const oldFilePath = path.join(__dirname, '..', menu.fileUrl);
        fs.unlink(oldFilePath, (err) => {
          if (err) console.error('Error deleting old menu file:', err);
        });
      }
      // Update existing menu
      menu.fileUrl = fileUrl;
      menu.uploadedAt = Date.now();
      await menu.save();
    } else {
      // Create new menu entry
      menu = await Menu.create({ fileUrl });
    }

    res.status(200).json({ msg: 'Menu updated successfully', fileUrl: menu.fileUrl });

  } catch (error) {
    console.error('Error in uploadMenu try-catch block:', error.message); // Added log
    // If there's an error, delete the newly uploaded file
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting uploaded file on menu update error:', err);
      });
    }
    res.status(500).json({ msg: error.message });
  }
};

module.exports = {
  getMenu,
  uploadMenu,
};

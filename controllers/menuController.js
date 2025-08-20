// controllers/menuController.js
const Menu = require('../models/Menu');
const fs = require('fs');
const path = require('path');

// @desc    Get the current menu PDF URL
// @route   GET /api/menu
// @access  Public
const getMenu = async (req, res) => {
  try {
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
  console.log('--- Inside uploadMenu controller ---');
  console.log('req.file:', req.file); // Este log agora deve mostrar o objeto do arquivo
  console.log('req.body:', req.body);

  const fileUrl = req.file ? `/uploads/${req.file.filename}` : null;

  if (!fileUrl) {
    console.error('Error: PDF file is required in menu upload. req.file was not set.');
    return res.status(400).json({ msg: 'PDF file is required' });
  }

  try {
    let menu = await Menu.findOne();

    if (menu) {
      if (menu.fileUrl) {
        const oldFilePath = path.join(__dirname, '..', menu.fileUrl);
        // Exclui o arquivo antigo de forma assíncrona
        fs.unlink(oldFilePath, (err) => {
          if (err) console.error('Error deleting old menu file:', err);
        });
      }
      menu.fileUrl = fileUrl;
      menu.uploadedAt = Date.now();
      await menu.save();
    } else {
      menu = await Menu.create({ fileUrl });
    }

    res.status(200).json({ msg: 'Menu updated successfully', fileUrl: menu.fileUrl });

  } catch (error) {
    console.error('Error in uploadMenu try-catch block:', error.message);
    // Se houver um erro, tenta excluir o arquivo recém-carregado para limpeza
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

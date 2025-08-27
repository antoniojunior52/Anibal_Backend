// controllers/menuController.js
const Menu = require('../models/Menu');
const fs = require('fs');
const path = require('path');

// @desc    Get the current menu PDF URL
// @route   GET /api/menu
// @access  Public
const getMenu = async (req, res) => {
  try {
    const menu = await Menu.findOne().sort({ uploadedAt: -1 });
    if (menu) {
      res.json({ fileUrl: menu.fileUrl });
    } else {
      res.status(404).json({ msg: 'Nenhum cardápio encontrado.' });
    }
  } catch (error) {
    res.status(500).json({ msg: 'Erro ao buscar o cardápio.' });
  }
};

// @desc    Upload/Update the menu PDF
// @route   POST /api/menu
// @access  Private (Admin/Secretaria)
const uploadMenu = async (req, res) => {
  console.log('--- Dentro do controlador uploadMenu ---');
  console.log('req.file:', req.file); // Este log agora deve mostrar o objeto do arquivo
  console.log('req.body:', req.body);

  const fileUrl = req.file ? `/uploads/${req.file.filename}` : null;

  if (!fileUrl) {
    console.error('Erro: O arquivo PDF é obrigatório para o upload do cardápio. req.file não foi definido.');
    return res.status(400).json({ msg: 'O arquivo PDF é obrigatório.' });
  }

  try {
    let menu = await Menu.findOne();

    if (menu) {
      if (menu.fileUrl) {
        const oldFilePath = path.join(__dirname, '..', menu.fileUrl);
        // Exclui o arquivo antigo de forma assíncrona
        fs.unlink(oldFilePath, (err) => {
          if (err) console.error('Erro ao deletar o arquivo do cardápio antigo:', err);
        });
      }
      menu.fileUrl = fileUrl;
      menu.uploadedAt = Date.now();
      await menu.save();
    } else {
      menu = await Menu.create({ fileUrl });
    }

    res.status(200).json({ msg: 'Cardápio atualizado com sucesso.', fileUrl: menu.fileUrl });

  } catch (error) {
    console.error('Erro no bloco try-catch de uploadMenu:', error.message);
    // Se houver um erro, tenta excluir o arquivo recém-carregado para limpeza
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Erro ao deletar o arquivo enviado durante um erro na atualização do cardápio:', err);
      });
    }
    res.status(500).json({ msg: 'Erro ao atualizar o cardápio.' });
  }
};

module.exports = {
  getMenu,
  uploadMenu,
};

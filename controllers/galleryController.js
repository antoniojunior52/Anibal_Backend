// controllers/galleryController.js
const Gallery = require('../models/Gallery');
const fs = require('fs');
const path = require('path');

const getGalleryImages = async (req, res) => {
  try {
    const images = await Gallery.find().sort({ uploadedAt: -1 });
    res.json(images);
  } catch (error) {
    res.status(500).json({ msg: 'Erro ao buscar imagens da galeria.' });
  }
};

const uploadGalleryImage = async (req, res) => {
  const { caption } = req.body;
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
  if (!imageUrl) {
    return res.status(400).json({ msg: 'O arquivo de imagem é obrigatório.' });
  }
  try {
    const newImage = await Gallery.create({ url: imageUrl, caption });
    res.status(201).json(newImage);
  } catch (error) {
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Erro ao deletar o arquivo enviado:', err);
      });
    }
    res.status(500).json({ msg: 'Erro ao fazer upload da imagem.' });
  }
};

const deleteGalleryImage = async (req, res) => {
  const { id } = req.params;
  try {
    const image = await Gallery.findById(id);
    if (!image) {
      return res.status(404).json({ msg: 'Imagem não encontrada.' });
    }
    if (image.url) {
      const imagePath = path.join(__dirname, '..', image.url);
      fs.unlink(imagePath, (err) => {
        if (err) console.error('Erro ao deletar o arquivo de imagem:', err);
      });
    }
    await image.deleteOne();
    res.status(200).json({ msg: 'Imagem removida com sucesso.' });
  } catch (error) {
    res.status(500).json({ msg: 'Erro ao deletar a imagem.' });
  }
};

module.exports = {
  getGalleryImages,
  uploadGalleryImage,
  deleteGalleryImage,
};

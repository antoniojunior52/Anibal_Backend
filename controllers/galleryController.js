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
  const files = req.files;

  if (!files || files.length === 0) {
    return res.status(400).json({ msg: 'Pelo menos um arquivo de imagem é obrigatório.' });
  }

  const uploadedImages = [];
  try {
    for (const file of files) {
      const imageUrl = `/uploads/${file.filename}`;
      const newImage = await Gallery.create({ url: imageUrl, caption });
      uploadedImages.push(newImage);
    }
    res.status(201).json(uploadedImages);
  } catch (error) {
    // Se houver um erro, tente deletar os arquivos já enviados
    if (files) {
      files.forEach(file => {
        fs.unlink(file.path, (err) => {
          if (err) console.error('Erro ao deletar o arquivo enviado:', err);
        });
      });
    }
    res.status(500).json({ msg: 'Erro ao fazer upload das imagens.' });
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
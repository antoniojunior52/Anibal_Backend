// controllers/galleryController.js
const Gallery = require('../models/Gallery');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp'); // Importar a biblioteca sharp

const getGalleryImages = async (req, res) => {
  try {
    const images = await Gallery.find({isActive: true}).sort({ uploadedAt: -1 });
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
  const processedFiles = [];

  try {
    for (const file of files) {
      const tempImagePath = file.path;
      const filename = `${file.filename.split('.')[0]}_optimized.webp`;
      const finalImagePath = path.join(__dirname, '..', 'uploads', filename);
      const webPath = `/uploads/${filename}`;

      // Processa a imagem com sharp: redimensiona e converte para WebP
      await sharp(tempImagePath)
        .resize(300) // Redimensiona para uma largura de 800px
        .webp({ quality: 80 }) // Converte para WebP com 80% de qualidade
        .toFile(finalImagePath); // Salva o novo arquivo

      // Remove o arquivo temporário original após o processamento
      fs.unlinkSync(tempImagePath);
      
      const newImage = await Gallery.create({ 
        url: webPath, 
        caption,
        authorEmail: req.user.email,
      });
      uploadedImages.push(newImage);
      processedFiles.push(finalImagePath); // Adiciona o novo caminho para o array de arquivos processados
    }
    res.status(201).json(uploadedImages);
  } catch (error) {
    // Se ocorrer um erro, tente remover os arquivos processados para evitar lixo
    processedFiles.forEach(filepath => {
      if (fs.existsSync(filepath)) {
        fs.unlink(filepath, (err) => {
          if (err) console.error('Erro ao deletar o arquivo otimizado:', err);
        });
      }
    });
    // Tente remover arquivos temporários que não foram processados
    if (files) {
      files.forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlink(file.path, (err) => {
            if (err) console.error('Erro ao deletar o arquivo enviado:', err);
          });
        }
      });
    }
    res.status(500).json({ msg: 'Erro ao fazer upload das imagens. Falha no processamento.' });
  }
};

const deleteGalleryImage = async (req, res) => {
  const { id } = req.params;
    try {
      const event = await Gallery.findByIdAndUpdate(id, { isActive: false }, { new: true });
  
      if (!event) {
        return res.status(404).json({ msg: 'Imagem não encontrada.' });
      }
  
      res.json({ msg: 'Imagem inativada com sucesso.', event });
    } catch (error) {
      res.status(500).json({ msg: 'Erro ao inativar a imagem.' });
    }
};

module.exports = {
  getGalleryImages,
  uploadGalleryImage,
  deleteGalleryImage,
};
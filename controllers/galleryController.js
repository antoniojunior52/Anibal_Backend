// controllers/galleryController.js
const Gallery = require('../models/Gallery');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const getGalleryImages = async (req, res) => {
  try {
    const images = await Gallery.find({isActive: true}).sort({ uploadedAt: -1 });
    res.json(images);
  } catch (error) {
    res.status(500).json({ msg: 'Erro ao buscar imagens da galeria.' });
  }
};

const uploadGalleryImage = async (req, res) => {
  const { album } = req.body;
  const files = req.files;

  if (!files || files.length === 0) {
    return res.status(400).json({ msg: 'Pelo menos um arquivo de imagem é obrigatório.' });
  }
  if (!album) {
    return res.status(400).json({ msg: 'O nome do álbum é obrigatório.' });
  }

  const uploadedImages = [];
  const filesToDelete = [];

  try {
    for (const file of files) {
      filesToDelete.push(file.path); // Adicionar ficheiro original à lista de exclusão

      const originalName = file.filename.split('.')[0];
      
      // Nomes e caminhos para a imagem em alta resolução e a miniatura
      const highResFilename = `${originalName}_large.webp`;
      const thumbFilename = `${originalName}_thumb.webp`;
      const highResFinalPath = path.join(__dirname, '..', 'uploads', highResFilename);
      const thumbFinalPath = path.join(__dirname, '..', 'uploads', thumbFilename);
      const highResWebPath = `/uploads/${highResFilename}`;
      const thumbWebPath = `/uploads/${thumbFilename}`;

      filesToDelete.push(highResFinalPath, thumbFinalPath); // Adicionar novos ficheiros à lista de exclusão em caso de erro

      // Processar e guardar a imagem em alta resolução (máx 1920px de largura)
      await sharp(file.path)
        .resize(1920, null, { withoutEnlargement: true })
        .webp({ quality: 85 })
        .toFile(highResFinalPath);

      // Processar e guardar a miniatura (400px de largura)
      await sharp(file.path)
        .resize(400)
        .webp({ quality: 75 })
        .toFile(thumbFinalPath);
      
      const newImage = await Gallery.create({ 
        url: highResWebPath,         // Caminho para a imagem grande
        thumbnailUrl: thumbWebPath,  // Caminho para a miniatura
        album,
        caption: album,
        authorEmail: req.user.email,
      });
      uploadedImages.push(newImage);
    }
    
    // Limpar apenas o ficheiro temporário original após sucesso
    files.forEach(file => fs.unlinkSync(file.path));

    res.status(201).json(uploadedImages);
  } catch (error) {
    // Se ocorrer um erro, remover todos os ficheiros criados (temporários e processados)
    filesToDelete.forEach(filepath => {
      if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
    });
    console.error('Erro no upload da galeria:', error);
    res.status(500).json({ msg: 'Erro ao fazer upload das imagens. Falha no processamento.' });
  }
};

const deleteGalleryAlbum = async (req, res) => {
  const { albumName } = req.params;
  try {
    const decodedAlbumName = decodeURIComponent(albumName);
    await Gallery.updateMany({ album: decodedAlbumName }, { $set: { isActive: false } });
    res.json({ msg: `Álbum "${decodedAlbumName}" inativado com sucesso.` });
  } catch (error) {
    res.status(500).json({ msg: 'Erro ao inativar o álbum.' });
  }
};

const deleteGalleryImage = async (req, res) => {
  const { id } = req.params;
    try {
      const gallery = await Gallery.findByIdAndUpdate(id, { isActive: false }, { new: true });
      if (!gallery) {
        return res.status(404).json({ msg: 'Imagem não encontrada.' });
      }
      res.json({ msg: 'Imagem inativada com sucesso.', gallery });
    } catch (error) {
      res.status(500).json({ msg: 'Erro ao inativar a imagem.' });
    }
};

module.exports = {
  getGalleryImages,
  uploadGalleryImage,
  deleteGalleryImage,
  deleteGalleryAlbum,
};


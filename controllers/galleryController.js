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
  const files = req.files; // Agora são arquivos em MEMÓRIA (Buffers)

  if (!files || files.length === 0) {
    return res.status(400).json({ msg: 'Pelo menos um arquivo de imagem é obrigatório.' });
  }
  if (!album) {
    return res.status(400).json({ msg: 'O nome do álbum é obrigatório.' });
  }

  const uploadedImages = [];
  const filesToDelete = []; // Caminhos criados para deletar em caso de erro

  try {
    for (const file of files) {
      const originalName = file.originalname.split('.')[0];
      const uniqueSuffix = Date.now(); // Garantir unicidade
      
      const highResFilename = `${originalName}_${uniqueSuffix}_large.webp`;
      const thumbFilename = `${originalName}_${uniqueSuffix}_thumb.webp`;
      
      const highResFinalPath = path.join(__dirname, '..', 'uploads', highResFilename);
      const thumbFinalPath = path.join(__dirname, '..', 'uploads', thumbFilename);
      
      const highResWebPath = `/uploads/${highResFilename}`;
      const thumbWebPath = `/uploads/${thumbFilename}`;

      filesToDelete.push(highResFinalPath, thumbFinalPath);

      // Processar Buffer -> Arquivo (High Res)
      await sharp(file.buffer)
        .resize(1920, null, { withoutEnlargement: true })
        .webp({ quality: 85 })
        .toFile(highResFinalPath);

      // Processar Buffer -> Arquivo (Thumb)
      await sharp(file.buffer)
        .resize(400)
        .webp({ quality: 75 })
        .toFile(thumbFinalPath);
      
      const newImage = await Gallery.create({ 
        url: highResWebPath,
        thumbnailUrl: thumbWebPath,
        album,
        caption: album,
        authorEmail: req.user.email,
      });
      uploadedImages.push(newImage);
    }
    
    // Nota: Com memoryStorage não existem arquivos temporários originais para deletar

    res.status(201).json(uploadedImages);
  } catch (error) {
    // Se der erro, deleta o que foi criado no disco
    filesToDelete.forEach(filepath => {
      if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
    });
    console.error('Erro no upload da galeria:', error);
    res.status(500).json({ msg: 'Erro ao fazer upload das imagens.' });
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
// controllers/galleryController.js
const Gallery = require('../models/Gallery');
const fs = require('fs');
const path = require('path');

const getGalleryImages = async (req, res) => {
  try {
    const images = await Gallery.find().sort({ uploadedAt: -1 });
    res.json(images);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

const uploadGalleryImage = async (req, res) => {
  const { caption } = req.body;
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
  if (!imageUrl) {
    return res.status(400).json({ msg: 'Image file is required' });
  }
  try {
    const newImage = await Gallery.create({ url: imageUrl, caption });
    res.status(201).json(newImage);
  } catch (error) {
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting uploaded file:', err);
      });
    }
    res.status(500).json({ msg: error.message });
  }
};

const deleteGalleryImage = async (req, res) => {
  const { id } = req.params;
  try {
    const image = await Gallery.findById(id);
    if (!image) {
      return res.status(404).json({ msg: 'Image not found' });
    }
    if (image.url) {
      const imagePath = path.join(__dirname, '..', image.url);
      fs.unlink(imagePath, (err) => {
        if (err) console.error('Error deleting image file:', err);
      });
    }
    await image.deleteOne();
    res.status(200).json({ msg: 'Image removed' });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

module.exports = {
  getGalleryImages,
  uploadGalleryImage,
  deleteGalleryImage,
};

// controllers/newsController.js
const News = require('../models/News');
const fs = require('fs');
const path = require('path');

// @desc    Get all news
// @route   GET /api/news
// @access  Public
const getNews = async (req, res) => {
  try {
    const news = await News.find().sort({ date: -1 }); // Sort by newest first
    res.json(news);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

// @desc    Create a new news article
// @route   POST /api/news
// @access  Private (Admin/Secretaria)
const createNews = async (req, res) => {
  const { title, content } = req.body;
  const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

  if (!imagePath) {
    return res.status(400).json({ msg: 'Image file is required' });
  }

  try {
    const news = await News.create({
      title,
      content,
      image: imagePath,
    });
    res.status(201).json(news);
  } catch (error) {
    // If there's an error creating news, delete the uploaded file
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting uploaded file:', err);
      });
    }
    res.status(500).json({ msg: error.message });
  }
};

// @desc    Update a news article
// @route   PUT /api/news/:id
// @access  Private (Admin/Secretaria)
const updateNews = async (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;
  const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

  try {
    const news = await News.findById(id);

    if (!news) {
      // If news not found, delete the newly uploaded file if any
      if (req.file) {
        fs.unlink(req.file.path, (err) => {
          if (err) console.error('Error deleting new uploaded file:', err);
        });
      }
      return res.status(404).json({ msg: 'News article not found' });
    }

    // If a new image is uploaded, delete the old one
    if (imagePath && news.image) {
      const oldImagePath = path.join(__dirname, '..', news.image);
      fs.unlink(oldImagePath, (err) => {
        if (err) console.error('Error deleting old image file:', err);
      });
    }

    news.title = title || news.title;
    news.content = content || news.content;
    news.image = imagePath || news.image; // Update with new image path or keep old

    const updatedNews = await news.save();
    res.json(updatedNews);

  } catch (error) {
    // If there's an error updating news, delete the newly uploaded file if any
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting uploaded file on update error:', err);
      });
    }
    res.status(500).json({ msg: error.message });
  }
};

// @desc    Delete a news article
// @route   DELETE /api/news/:id
// @access  Private (Admin/Secretaria)
const deleteNews = async (req, res) => {
  const { id } = req.params;

  try {
    const news = await News.findById(id);

    if (!news) {
      return res.status(404).json({ msg: 'News article not found' });
    }

    // Delete associated image file
    if (news.image) {
      const imagePath = path.join(__dirname, '..', news.image);
      fs.unlink(imagePath, (err) => {
        if (err) console.error('Error deleting image file:', err);
      });
    }

    await news.deleteOne();
    res.status(200).json({ msg: 'News article removed' });

  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

module.exports = {
  getNews,
  createNews,
  updateNews,
  deleteNews,
};

// controllers/newsController.js
const News = require('../models/News');
const fs = require('fs');
const path = require('path');

const getNews = async (req, res) => {
  try {
    const news = await News.find().sort({ date: -1 });
    res.json(news);
  } catch (error) {
    res.status(500).json({ msg: 'Erro ao buscar notícias.' });
  }
};

const createNews = async (req, res) => {
  const { title, content } = req.body;
  const imagePath = req.file ? `/uploads/${req.file.filename}` : null;
  if (!imagePath) {
    return res.status(400).json({ msg: 'O arquivo de imagem é obrigatório.' });
  }
  try {
    const news = await News.create({ title, content, image: imagePath });
    res.status(201).json(news);
  } catch (error) {
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Erro ao deletar o arquivo enviado:', err);
      });
    }
    res.status(500).json({ msg: 'Erro ao criar notícia.' });
  }
};

const updateNews = async (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;
  const imagePath = req.file ? `/uploads/${req.file.filename}` : null;
  try {
    const news = await News.findById(id);
    if (!news) {
      if (req.file) {
        fs.unlink(req.file.path, (err) => {
          if (err) console.error('Erro ao deletar o novo arquivo enviado:', err);
        });
      }
      return res.status(404).json({ msg: 'Artigo de notícia não encontrado.' });
    }
    if (imagePath && news.image) {
      const oldImagePath = path.join(__dirname, '..', news.image);
      fs.unlink(oldImagePath, (err) => {
        if (err) console.error('Erro ao deletar o arquivo de imagem antigo:', err);
      });
    }
    news.title = title || news.title;
    news.content = content || news.content;
    news.image = imagePath || news.image;
    const updatedNews = await news.save();
    res.json(updatedNews);
  } catch (error) {
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Erro ao deletar o arquivo enviado durante um erro na atualização:', err);
      });
    }
    res.status(500).json({ msg: 'Erro ao atualizar a notícia.' });
  }
};

const deleteNews = async (req, res) => {
  const { id } = req.params;
  try {
    const news = await News.findById(id);
    if (!news) {
      return res.status(404).json({ msg: 'Artigo de notícia não encontrado.' });
    }
    if (news.image) {
      const imagePath = path.join(__dirname, '..', news.image);
      fs.unlink(imagePath, (err) => {
        if (err) console.error('Erro ao deletar o arquivo de imagem:', err);
      });
    }
    await news.deleteOne();
    res.status(200).json({ msg: 'Artigo de notícia removido.' });
  } catch (error) {
    res.status(500).json({ msg: 'Erro ao deletar a notícia.' });
  }
};

module.exports = {
  getNews,
  createNews,
  updateNews,
  deleteNews,
};

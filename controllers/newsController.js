// controllers/newsController.js
const News = require('../models/News');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const getNews = async (req, res) => {
  try {
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    await News.updateMany(
      { date: { $lt: threeMonthsAgo }, isActive: true },
      { $set: { isActive: false } }
    );

    const news = await News.find({ isActive: true }).sort({ date: -1 });

    res.json(news);
  } catch (error) {
    res.status(500).json({ msg: 'Erro ao buscar notícias.' });
  }
};

const createNews = async (req, res) => {
  const { title, content, externalLink } = req.body;
  if (!req.file) {
    return res.status(400).json({ msg: 'O arquivo de imagem é obrigatório.' });
  }

  const tempImagePath = req.file.path;
  const filename = `${req.file.filename.split('.')[0]}_optimized.webp`;
  const finalImagePath = path.join(__dirname, '..', 'uploads', filename);
  const webPath = `/uploads/${filename}`;

  try {
    await sharp(tempImagePath)
      .resize(300)
      .webp({ quality: 80 })
      .toFile(finalImagePath);

    fs.unlinkSync(tempImagePath);

    const news = await News.create({
      title,
      content,
      image: webPath,
      authorEmail: req.user.email,
      externalLink, // Salva o link externo, se fornecido
    });
    res.status(201).json(news);
  } catch (error) {
    if (fs.existsSync(tempImagePath)) fs.unlinkSync(tempImagePath);
    if (fs.existsSync(finalImagePath)) fs.unlinkSync(finalImagePath);
    res.status(500).json({ msg: 'Erro ao criar a notícia. Falha no processamento da imagem.' });
  }
};

const updateNews = async (req, res) => {
  const { id } = req.params;
  const { title, content, externalLink } = req.body; // Adicionado externalLink
  const imagePath = req.file ? `/uploads/${req.file.filename}` : null;
  try {
    const news = await News.findById(id);
    if (!news) {
      return res.status(404).json({ msg: 'Notícia não encontrado.' });
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
    if (externalLink !== undefined) { // Atualiza o link apenas se for fornecido
      news.externalLink = externalLink;
    }
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
      return res.status(404).json({ msg: 'Notícia não encontrada.' });
    }
    
    news.isActive = false;
    await news.save();

    res.json({ msg: 'Notícia inativada com sucesso.' });
    
  } catch (error) {
    res.status(500).json({ msg: 'Erro ao inativar a notícia.' });
  }
};

module.exports = {
  getNews,
  createNews,
  updateNews,
  deleteNews,
};
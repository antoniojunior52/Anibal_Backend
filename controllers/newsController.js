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

  // Gera nome do arquivo
  const filename = `${Date.now()}_news_optimized.webp`;
  const finalImagePath = path.join(__dirname, '..', 'uploads', filename);
  const webPath = `/uploads/${filename}`;

  try {
    // O Sharp processa direto do Buffer (Memória) -> Para o Disco
    await sharp(req.file.buffer)
      .resize(300)
      .webp({ quality: 80 })
      .toFile(finalImagePath);

    const news = await News.create({
      title,
      content,
      image: webPath,
      authorEmail: req.user.email,
      externalLink,
    });
    res.status(201).json(news);
  } catch (error) {
    // Se der erro, deleta a imagem se ela chegou a ser criada
    if (fs.existsSync(finalImagePath)) fs.unlinkSync(finalImagePath);
    res.status(500).json({ msg: 'Erro ao criar a notícia.' });
  }
};

const updateNews = async (req, res) => {
  const { id } = req.params;
  const { title, content, externalLink } = req.body;
  
  let imagePath = null;

  // Se enviou arquivo novo, processa com Sharp
  if (req.file) {
      try {
        const filename = `${Date.now()}_news_upd.webp`;
        const finalPath = path.join(__dirname, '..', 'uploads', filename);
        
        await sharp(req.file.buffer)
          .resize(300)
          .webp({ quality: 80 })
          .toFile(finalPath);
          
        imagePath = `/uploads/${filename}`;
      } catch (err) {
          return res.status(500).json({msg: "Erro ao processar imagem."});
      }
  }

  try {
    const news = await News.findById(id);
    if (!news) {
      return res.status(404).json({ msg: 'Notícia não encontrada.' });
    }

    // Deleta imagem antiga se houver nova
    if (imagePath && news.image) {
      const oldImagePath = path.join(__dirname, '..', news.image);
      if (fs.existsSync(oldImagePath)) {
          fs.unlink(oldImagePath, (err) => {
            if (err) console.error('Erro ao deletar imagem antiga:', err);
          });
      }
    }

    news.title = title || news.title;
    news.content = content || news.content;
    news.image = imagePath || news.image; // Atualiza ou mantém
    if (externalLink !== undefined) { 
      news.externalLink = externalLink;
    }

    const updatedNews = await news.save();
    res.json(updatedNews);
  } catch (error) {
      // Limpeza em caso de erro
      if (imagePath) {
          const p = path.join(__dirname, '..', imagePath);
          if (fs.existsSync(p)) fs.unlinkSync(p);
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
// controllers/noticeController.js
const Notice = require('../models/Notice');
const User = require('../models/User'); // Para obter o nome do autor

// @desc    Get all notices
// @route   GET /api/notices
// @access  Public
const getNotices = async (req, res) => {
  try {
    const notices = await Notice.find().sort({ createdAt: -1 }); // Classificar do mais novo para o mais antigo
    res.json(notices);
  } catch (error) {
    res.status(500).json({ msg: 'Erro ao buscar avisos.' });
  }
};

// @desc    Create a new notice
// @route   POST /api/notices
// @access  Private (Admin/Secretaria)
const createNotice = async (req, res) => {
  const { content } = req.body;

  try {
    const user = await User.findById(req.user._id); // req.user é populado pelo middleware de autenticação
    if (!user) {
      return res.status(404).json({ msg: 'Usuário não encontrado.' });
    }

    const notice = await Notice.create({
      content,
      author: user.name, // Salvar o nome do usuário que o criou
    });
    res.status(201).json(notice);
  } catch (error) {
    res.status(500).json({ msg: 'Erro ao criar aviso.' });
  }
};

// @desc    Delete a notice
// @route   DELETE /api/notices/:id
// @access  Private (Admin only)
const deleteNotice = async (req, res) => {
  const { id } = req.params;

  try {
    const notice = await Notice.findById(id);

    if (!notice) {
      return res.status(404).json({ msg: 'Aviso não encontrado.' });
    }

    await notice.deleteOne();
    res.status(200).json({ msg: 'Aviso removido.' });

  } catch (error) {
    res.status(500).json({ msg: 'Erro ao remover aviso.' });
  }
};

module.exports = {
  getNotices,
  createNotice,
  deleteNotice,
};

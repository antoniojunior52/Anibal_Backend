// controllers/noticeController.js
const Notice = require('../models/Notice');
const User = require('../models/User'); // Para obter o nome do autor

// @desc    Get all notices
// @route   GET /api/notices
// @access  Public
const getNotices = async (req, res) => {
  try {
    const notices = await Notice.find({ isActive: true }).sort({ createdAt: -1 }); 
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
      author: user.email, // Salvar o nome do usuário que o criou
    });
    res.status(201).json(notice);
  } catch (error) {
    res.status(500).json({ msg: 'Erro ao criar aviso.' });
  }
};

// @desc    Delete a notice
// @route   DELETE /api/notices/:id
// @access  Private (Admin only)
// ... seus outros imports ...
const deleteNotice = async (req, res) => {
  const { id } = req.params;

  try {
    const notice = await Notice.findByIdAndUpdate(id, { isActive: false }, { new: true });

    if (!notice) {
      return res.status(404).json({ msg: 'Aviso não encontrado.' });
    }

    res.status(200).json({ msg: 'Aviso inativado com sucesso.' });
  } catch (error) {
    res.status(500).json({ msg: 'Erro ao inativar aviso.' });
  }
};

const deactivateOldNotices = async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Define a data de hoje para meia-noite

    try {
        const oldNotices = await Notice.find({
            createdAt: { $lt: today }, // Busca avisos criados antes da meia-noite de hoje
            isActive: true,
        });

        if (oldNotices.length > 0) {
            const idsToDeactivate = oldNotices.map(notice => notice._id);
            await Notice.updateMany({ _id: { $in: idsToDeactivate } }, { $set: { isActive: false } });
            console.log(`${oldNotices.length} avisos inativados.`);
        } else {
            console.log('Nenhum aviso para inativar hoje.');
        }
    } catch (error) {
        console.error('Erro ao inativar avisos:', error);
    }
};

module.exports = {
    getNotices,
    createNotice,
    deleteNotice,
    deactivateOldNotices,
};

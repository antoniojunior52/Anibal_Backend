// controllers/scheduleController.js
const Schedule = require('../models/Schedule');
const fs = require('fs');
const path = require('path');

const getSchedules = async (req, res) => {
  try {
    // Modificação: Busca apenas por horários ativos (isActive: true)
    const schedules = await Schedule.find({ isActive: true }).sort({ className: 1 });
    
    const schedulesObject = schedules.reduce((acc, curr) => {
      acc[curr.className] = curr.fileUrl;
      return acc;
    }, {});
    
    res.json(schedulesObject);
  } catch (error) {
    console.error('Erro ao buscar horários:', error);
    res.status(500).json({ msg: 'Erro ao buscar horários.' });
  }
};

const uploadSchedule = async (req, res) => {
  console.log('Requisição de upload de horário recebida.');
  const { className, author } = req.body;
  const fileUrl = req.file ? `/uploads/${req.file.filename}` : null;

  if (!className || !fileUrl) {
    console.error('Dados ausentes no upload de horário.');
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Erro ao deletar o arquivo recém-enviado devido a dados ausentes:', err);
      });
    }
    return res.status(400).json({ msg: 'O nome da turma, e o arquivo do Excel são obrigatórios.' });
  }
  
  try {
    // 1. Buscar o horário ativo atual para a turma
    const currentActiveSchedule = await Schedule.findOne({ className, isActive: true });

    // 2. Se um horário ativo for encontrado, desativá-lo
    if (currentActiveSchedule) {
      currentActiveSchedule.isActive = false;
      await currentActiveSchedule.save();
      console.log(`Horário anterior para ${className} desativado.`);
    }

    // 3. Criar o novo registro de horário, que será ativo por padrão
    const newSchedule = await Schedule.create({ 
      className, 
      fileUrl, 
      author: req.user.email,
      isActive: true,
      uploadedAt: Date.now(), // Garante que o novo registro seja o ativo
    });

    res.status(200).json({ msg: `Novo horário para ${className} criado com sucesso.`, newSchedule });
  } catch (error) {
    console.error('Erro durante o upload/criação do novo horário:', error);
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Erro ao deletar o arquivo recém-enviado devido a um erro no banco de dados:', err);
      });
    }
    res.status(500).json({ msg: error.message || 'Erro Interno do Servidor' });
  }
};


const deleteSchedule = async (req, res) => {
  const { className } = req.params;
  try {
    // Busca pelo horário ativo para a turma
    const schedule = await Schedule.findOne({ className: className, isActive: true });

    if (!schedule) {
      return res.status(404).json({ msg: 'Horário ativo não encontrado para esta turma.' });
    }

    // Altera o isActive para false (exclusão lógica)
    schedule.isActive = false;
    await schedule.save();

    // Retorna uma resposta de sucesso
    res.status(200).json({ msg: `Horário para ${className} desativado com sucesso.` });
  } catch (error) {
    console.error('Erro ao desativar o horário:', error);
    res.status(500).json({ msg: error.message || 'Erro Interno do Servidor' });
  }
};

module.exports = {
  getSchedules,
  uploadSchedule,
  deleteSchedule,
};

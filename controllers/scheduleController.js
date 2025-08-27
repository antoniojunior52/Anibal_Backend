// controllers/scheduleController.js
const Schedule = require('../models/Schedule');
const fs = require('fs');
const path = require('path');

const getSchedules = async (req, res) => {
  try {
    const schedules = await Schedule.find().sort({ className: 1 });
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
  console.log('req.body:', req.body);
  console.log('req.file:', req.file);
  const { className } = req.body;
  const fileUrl = req.file ? `/uploads/${req.file.filename}` : null;
  if (!className || !fileUrl) {
    console.error('Nome da turma ou URL do arquivo ausente no upload de horário.');
    return res.status(400).json({ msg: 'O nome da turma e o arquivo do Excel são obrigatórios.' });
  }
  try {
    let schedule = await Schedule.findOne({ className });
    if (schedule) {
      if (schedule.fileUrl) {
        const oldFilePath = path.join(__dirname, '..', schedule.fileUrl);
        fs.unlink(oldFilePath, (err) => {
          if (err) console.error('Erro ao deletar o arquivo de horário antigo:', err);
        });
      }
      schedule.fileUrl = fileUrl;
      schedule.uploadedAt = Date.now();
      await schedule.save();
    } else {
      schedule = await Schedule.create({ className, fileUrl });
    }
    res.status(200).json({ msg: `Horário para ${className} atualizado com sucesso.`, schedule });
  } catch (error) {
    console.error('Erro durante o upload/atualização do horário:', error);
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Erro ao deletar o arquivo recém-enviado devido a um erro na atualização do horário:', err);
      });
    }
    res.status(500).json({ msg: error.message || 'Erro Interno do Servidor' });
  }
};

const deleteSchedule = async (req, res) => {
  const { className } = req.params;
  try {
    const schedule = await Schedule.findOne({ className });
    if (!schedule) {
      return res.status(404).json({ msg: 'Horário não encontrado para esta turma.' });
    }
    if (schedule.fileUrl) {
      const filePath = path.join(__dirname, '..', schedule.fileUrl);
      fs.unlink(filePath, (err) => {
        if (err) console.error('Erro ao deletar o arquivo de horário:', err);
      });
    }
    await schedule.deleteOne();
    res.status(200).json({ msg: `Horário para ${className} removido.` });
  } catch (error) {
    console.error('Erro ao deletar o horário:', error);
    res.status(500).json({ msg: error.message || 'Erro Interno do Servidor' });
  }
};

module.exports = {
  getSchedules,
  uploadSchedule,
  deleteSchedule,
};

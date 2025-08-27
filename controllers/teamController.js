// controllers/teamController.js
const Team = require('../models/Team');
const fs = require('fs');
const path = require('path');

const getTeam = async (req, res) => {
  try {
    const team = await Team.find().sort({ role: 1, name: 1 });
    res.json(team);
  } catch (error) {
    res.status(500).json({ msg: 'Erro ao buscar a equipe.' });
  }
};

const createTeamMember = async (req, res) => {
  const { name, role, subjects, bio } = req.body;
  const photoPath = req.file ? `/uploads/${req.file.filename}` : null;
  if (!photoPath) {
    return res.status(400).json({ msg: 'O arquivo de foto é obrigatório.' });
  }
  try {
    const teamMember = await Team.create({
      name,
      role,
      subjects: subjects ? subjects.split(',').map(s => s.trim()) : [],
      bio,
      photo: photoPath,
    });
    res.status(201).json(teamMember);
  } catch (error) {
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Erro ao deletar o arquivo enviado:', err);
      });
    }
    res.status(500).json({ msg: 'Erro ao criar membro da equipe.' });
  }
};

const updateTeamMember = async (req, res) => {
  const { id } = req.params;
  const { name, role, subjects, bio } = req.body;
  const photoPath = req.file ? `/uploads/${req.file.filename}` : null;
  try {
    const teamMember = await Team.findById(id);
    if (!teamMember) {
      if (req.file) {
        fs.unlink(req.file.path, (err) => {
          if (err) console.error('Erro ao deletar o novo arquivo enviado:', err);
        });
      }
      return res.status(404).json({ msg: 'Membro da equipe não encontrado.' });
    }
    if (photoPath && teamMember.photo) {
      const oldPhotoPath = path.join(__dirname, '..', teamMember.photo);
      fs.unlink(oldPhotoPath, (err) => {
        if (err) console.error('Erro ao deletar o arquivo de foto antigo:', err);
      });
    }
    teamMember.name = name || teamMember.name;
    teamMember.role = role || teamMember.role;
    teamMember.subjects = subjects ? subjects.split(',').map(s => s.trim()) : teamMember.subjects;
    teamMember.bio = bio || teamMember.bio;
    teamMember.photo = photoPath || teamMember.photo;
    const updatedTeamMember = await teamMember.save();
    res.json(updatedTeamMember);
  } catch (error) {
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Erro ao deletar o arquivo enviado durante um erro na atualização:', err);
      });
    }
    res.status(500).json({ msg: 'Erro ao atualizar membro da equipe.' });
  }
};

const deleteTeamMember = async (req, res) => {
  const { id } = req.params;
  try {
    const teamMember = await Team.findById(id);
    if (!teamMember) {
      return res.status(404).json({ msg: 'Membro da equipe não encontrado.' });
    }
    if (teamMember.photo) {
      const photoPath = path.join(__dirname, '..', teamMember.photo);
      fs.unlink(photoPath, (err) => {
        if (err) console.error('Erro ao deletar o arquivo de foto:', err);
      });
    }
    await teamMember.deleteOne();
    res.status(200).json({ msg: 'Membro da equipe removido.' });
  } catch (error) {
    res.status(500).json({ msg: 'Erro ao deletar membro da equipe.' });
  }
};

module.exports = {
  getTeam,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
};

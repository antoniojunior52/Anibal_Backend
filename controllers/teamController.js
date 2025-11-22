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

// Função auxiliar para salvar arquivo do buffer
const saveFileFromBuffer = (buffer, originalName) => {
    const uploadsDir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
    
    const ext = path.extname(originalName) || '.jpg';
    const filename = `team-${Date.now()}${ext}`;
    const filepath = path.join(uploadsDir, filename);
    
    fs.writeFileSync(filepath, buffer);
    return `/uploads/${filename}`;
};

const createTeamMember = async (req, res) => {
  const { name, role, subjects, bio } = req.body;
  
  // Lógica de arquivo alterada para usar Buffer
  let photoPath = null;
  if (req.file) {
      try {
          photoPath = saveFileFromBuffer(req.file.buffer, req.file.originalname);
      } catch (err) {
          return res.status(500).json({ msg: 'Erro ao salvar imagem.' });
      }
  }

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
    // Se der erro no banco, tentamos apagar a imagem criada
    if (photoPath) {
        const fullPath = path.join(__dirname, '..', photoPath);
        if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
    }
    res.status(500).json({ msg: 'Erro ao criar membro da equipe.' });
  }
};

const updateTeamMember = async (req, res) => {
  const { id } = req.params;
  const { name, role, subjects, bio } = req.body;
  
  let photoPath = null;
  if (req.file) {
      try {
          photoPath = saveFileFromBuffer(req.file.buffer, req.file.originalname);
      } catch (err) {
          return res.status(500).json({ msg: 'Erro ao salvar nova imagem.' });
      }
  }

  try {
    const teamMember = await Team.findById(id);
    if (!teamMember) {
      // Se criou imagem mas não achou user, apaga a imagem
      if (photoPath) fs.unlinkSync(path.join(__dirname, '..', photoPath));
      return res.status(404).json({ msg: 'Membro da equipe não encontrado.' });
    }

    // Se veio foto nova, apaga a antiga
    if (photoPath && teamMember.photo) {
      const oldPhotoPath = path.join(__dirname, '..', teamMember.photo);
      if (fs.existsSync(oldPhotoPath)) {
          fs.unlink(oldPhotoPath, (err) => {
             if (err) console.error('Erro ao deletar foto antiga:', err);
          });
      }
    }

    teamMember.name = name || teamMember.name;
    teamMember.role = role || teamMember.role;
    teamMember.subjects = subjects ? subjects.split(',').map(s => s.trim()) : teamMember.subjects;
    teamMember.bio = bio || teamMember.bio;
    teamMember.photo = photoPath || teamMember.photo; // Usa a nova ou mantém a velha

    const updatedTeamMember = await teamMember.save();
    res.json(updatedTeamMember);
  } catch (error) {
    if (photoPath) {
         const p = path.join(__dirname, '..', photoPath);
         if(fs.existsSync(p)) fs.unlinkSync(p);
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
      if (fs.existsSync(photoPath)) {
          fs.unlink(photoPath, (err) => {
            if (err) console.error('Erro ao deletar o arquivo de foto:', err);
          });
      }
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
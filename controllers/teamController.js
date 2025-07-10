// controllers/teamController.js
const Team = require('../models/Team');
const fs = require('fs');
const path = require('path');

// @desc    Get all team members
// @route   GET /api/team
// @access  Public
const getTeam = async (req, res) => {
  try {
    const team = await Team.find().sort({ role: 1, name: 1 }); // Sort by role then name
    res.json(team);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

// @desc    Create a new team member
// @route   POST /api/team
// @access  Private (Admin only)
const createTeamMember = async (req, res) => {
  const { name, role, subjects, bio } = req.body;
  const photoPath = req.file ? `/uploads/${req.file.filename}` : null;

  if (!photoPath) {
    return res.status(400).json({ msg: 'Photo file is required' });
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
    // If there's an error creating, delete the uploaded file
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting uploaded file:', err);
      });
    }
    res.status(500).json({ msg: error.message });
  }
};

// @desc    Update a team member
// @route   PUT /api/team/:id
// @access  Private (Admin only)
const updateTeamMember = async (req, res) => {
  const { id } = req.params;
  const { name, role, subjects, bio } = req.body;
  const photoPath = req.file ? `/uploads/${req.file.filename}` : null;

  try {
    const teamMember = await Team.findById(id);

    if (!teamMember) {
      // If not found, delete the newly uploaded file if any
      if (req.file) {
        fs.unlink(req.file.path, (err) => {
          if (err) console.error('Error deleting new uploaded file:', err);
        });
      }
      return res.status(404).json({ msg: 'Team member not found' });
    }

    // If a new photo is uploaded, delete the old one
    if (photoPath && teamMember.photo) {
      const oldPhotoPath = path.join(__dirname, '..', teamMember.photo);
      fs.unlink(oldPhotoPath, (err) => {
        if (err) console.error('Error deleting old photo file:', err);
      });
    }

    teamMember.name = name || teamMember.name;
    teamMember.role = role || teamMember.role;
    teamMember.subjects = subjects ? subjects.split(',').map(s => s.trim()) : teamMember.subjects;
    teamMember.bio = bio || teamMember.bio;
    teamMember.photo = photoPath || teamMember.photo; // Update with new photo path or keep old

    const updatedTeamMember = await teamMember.save();
    res.json(updatedTeamMember);

  } catch (error) {
    // If there's an error updating, delete the newly uploaded file if any
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting uploaded file on update error:', err);
      });
    }
    res.status(500).json({ msg: error.message });
  }
};

// @desc    Delete a team member
// @route   DELETE /api/team/:id
// @access  Private (Admin only)
const deleteTeamMember = async (req, res) => {
  const { id } = req.params;

  try {
    const teamMember = await Team.findById(id);

    if (!teamMember) {
      return res.status(404).json({ msg: 'Team member not found' });
    }

    // Delete associated photo file
    if (teamMember.photo) {
      const photoPath = path.join(__dirname, '..', teamMember.photo);
      fs.unlink(photoPath, (err) => {
        if (err) console.error('Error deleting photo file:', err);
      });
    }

    await teamMember.deleteOne();
    res.status(200).json({ msg: 'Team member removed' });

  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

module.exports = {
  getTeam,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
};

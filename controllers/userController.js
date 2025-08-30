// controllers/userController.js
const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// @desc    Get all users
// @route   GET /api/users
// @access  Private (Admin only)
const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password'); // Exclui senhas
    res.json(users);
  } catch (error) {
    res.status(500).json({ msg: 'Erro ao buscar usuários.' });
  }
};

// @desc    Get logged in user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (user) {
      res.json({
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isAdmin: user.isAdmin,
        isSecretaria: user.isSecretaria,
      });
    } else {
      res.status(404).json({ msg: 'Usuário não encontrado.' });
    }
  } catch (error) {
    res.status(500).json({ msg: 'Erro ao buscar perfil do usuário.' });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    
    // Check if the email is being changed and if the new email already exists
    if (req.body.email && req.body.email !== user.email) {
      const emailExists = await User.findOne({ email: req.body.email });
      if (emailExists && emailExists._id.toString() !== user._id.toString()) {
        res.status(400);
        throw new Error('Email já está em uso.');
      }
      user.email = req.body.email;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      isAdmin: updatedUser.isAdmin,
    });
  } else {
    res.status(404);
    throw new Error('Usuário não encontrado');
  }
});

// @desc    Change user password
// @route   PUT /api/users/change-password
// @access  Private
const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ msg: 'Usuário não encontrado.' });
    }

    if (!(await user.matchPassword(currentPassword))) {
      return res.status(401).json({ msg: 'A senha atual está incorreta.' });
    }

    user.password = newPassword; // O hook pre-save do Mongoose irá hashar isso
    await user.save();

    res.status(200).json({ msg: 'Senha atualizada com sucesso.' });
  } catch (error) {
    res.status(500).json({ msg: 'Erro ao atualizar a senha.' });
  }
};


// @desc    Update user permissions (Admin only)
// @route   PUT /api/users/:id
// @access  Private (Admin only)
const updateUserPermissions = async (req, res) => {
  const { id } = req.params;
  const { isAdmin, isSecretaria, role } = req.body;

  try {
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ msg: 'Usuário não encontrado.' });
    }

    // Impede que o administrador revogue seu próprio acesso de administrador
    if (req.user._id.toString() === id && isAdmin === false) {
      return res.status(403).json({ msg: 'Não é possível revogar seu próprio acesso de administrador.' });
    }

    if (typeof isAdmin === 'boolean') user.isAdmin = isAdmin;
    if (typeof isSecretaria === 'boolean') user.isSecretaria = isSecretaria;
    if (role) user.role = role;

    await user.save();
    res.json({ msg: 'Permissões do usuário atualizadas.', user: user.toObject({ getters: true, virtuals: false }) }); // Retorna o usuário atualizado sem a senha
  } catch (error) {
    res.status(500).json({ msg: 'Erro ao atualizar as permissões do usuário.' });
  }
};

// @desc    Delete user (Admin only)
// @route   DELETE /api/users/:id
// @access  Private (Admin only)
const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ msg: 'Usuário não encontrado.' });
    }

    // Impede que o administrador se exclua
    if (req.user._id.toString() === id) {
      return res.status(403).json({ msg: 'Não é possível se excluir.' });
    }

    await user.deleteOne();
    res.status(200).json({ msg: 'Usuário removido.' });
  } catch (error) {
    res.status(500).json({ msg: 'Erro ao remover usuário.' });
  }
};

module.exports = {
  getUsers,
  getUserProfile,
  updateUserProfile,
  changePassword,
  updateUserPermissions,
  deleteUser,
};

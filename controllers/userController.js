// controllers/userController.js
const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
// IMPORTA O HELPER DE E-MAIL
const { sendVerificationEmail } = require('../utils/email');

// Função helper para gerar código de 6 dígitos
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// @desc    Get all users
// @route   GET /api/users
// @access  Private (Admin only)
const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password'); // Exclui senhas
    res.json(users);
  } catch (error) {
    res.status(500).json({ msg: 'Erro ao buscar usuários.' });
  }
};

// @desc    Get logged in user profile
// @route   GET /api/users/profile
// @access  Private
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
        isVerified: user.isVerified, // Envia o status de verificação
      });
    } else {
      res.status(404).json({ msg: 'Usuário não encontrado.' });
    }
  } catch (error) {
    res.status(500).json({ msg: 'Erro ao buscar perfil do usuário.' });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  let needsReverification = false;

  if (user) {
    // <<< VERIFICAÇÃO ADICIONADA AQUI >>>
    // Impede que o usuário protegido altere seu próprio perfil (nome, email).
    if (user.isProtected) {
      res.status(403);
      throw new Error('Ação proibida. O perfil de usuário protegido não pode ser modificado.');
    }
    // <<< FIM DA VERIFICAÇÃO >>>

    user.name = req.body.name || user.name;

    if (req.body.email && req.body.email !== user.email) {
      const emailExists = await User.findOne({ email: req.body.email });
      if (emailExists && emailExists._id.toString() !== user._id.toString()) {
        res.status(400);
        throw new Error('Email já está em uso.');
      }

      // *** LÓGICA DE RE-VERIFICAÇÃO ADICIONADA ***
      try {
        const code = generateVerificationCode();
        user.email = req.body.email;
        user.isVerified = false;
        user.verificationCode = code;
        user.verificationCodeExpire = Date.now() + 90000; // 1.5 minutos (90000 ms)

        await sendVerificationEmail(user.email, code);
        needsReverification = true; // Sinaliza ao frontend
      } catch (emailError) {
        res.status(500);
        throw new Error(
          'O perfil foi salvo, mas o e-mail de verificação não pôde ser enviado.'
        );
      }
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      isAdmin: updatedUser.isAdmin,
      isVerified: updatedUser.isVerified,
      needsReverification: needsReverification, // Envia a flag
    });
  } else {
    res.status(404); // Corrigido de 4404 para 404
    throw new Error('Usuário não encontrado');
  }
});

// @desc    Change user password
// @route   PUT /api/users/change-password
// @access  Private
const changePassword = async (req, res) => {
  // NOTA: Esta rota usa 'req.user._id', o que significa que um usuário
  // só pode alterar a *própria* senha.
  // Se o usuário protegido for hackeado, ele *pode* alterar a própria senha.
  // Isso é o comportamento esperado. A proteção 'isProtected'
  // visa impedir que *outros* usuários alterem ou excluam o admin.
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

// @desc    Update user permissions (Admin only)
// @route   PUT /api/users/:id
// @access  Private (Admin only)
const updateUserPermissions = async (req, res) => {
  const { id } = req.params;
  const { isAdmin, isSecretaria, role } = req.body;

  try {
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ msg: 'Usuário não encontrado.' });
    }

    // <<< VERIFICAÇÃO ADICIONADA AQUI >>>
    // Impede que o usuário protegido tenha suas permissões alteradas por outros.
    if (user.isProtected) {
      return res.status(403).json({
        msg: 'Ação proibida. Este usuário é protegido e não pode ser modificado.',
      });
    }
    // <<< FIM DA VERIFICAÇÃO >>>

    if (req.user._id.toString() === id && isAdmin === false) {
      return res.status(403).json({
        msg: 'Não é possível revogar seu próprio acesso de administrador.',
      });
    }

    if (typeof isAdmin === 'boolean') user.isAdmin = isAdmin;
    if (typeof isSecretaria === 'boolean') user.isSecretaria = isSecretaria;
    if (role) user.role = role;

    const updatedUser = await user.save();

    // Retorna o usuário atualizado sem a senha
    const userObject = updatedUser.toObject();
    delete userObject.password;
    delete userObject.verificationCode;
    delete userObject.verificationCodeExpire;
    delete userObject.resetPasswordToken;
    delete userObject.resetPasswordExpire;

    res.json({
      msg: 'Permissões do usuário atualizadas.',
      user: userObject,
    });
  } catch (error) {
    res.status(500).json({ msg: 'Erro ao atualizar as permissões do usuário.' });
  }
};

// @desc    Delete user (Admin only)
// @route   DELETE /api/users/:id
// @access  Private (Admin only)
const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ msg: 'Usuário não encontrado.' });
    }

    // <<< VERIFICAÇÃO ADICIONADA AQUI >>>
    // Impede que o usuário protegido seja excluído.
    if (user.isProtected) {
      return res.status(403).json({
        msg: 'Ação proibida. Este usuário não pode ser excluído.',
      });
    }
    // <<< FIM DA VERIFICAÇÃO >>>

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
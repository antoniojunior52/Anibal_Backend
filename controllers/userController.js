// controllers/userController.js
const User = require('../models/User');

// @desc    Get all users
// @route   GET /api/users
// @access  Private (Admin only)
const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password'); // Exclude passwords
    res.json(users);
  } catch (error) {
    res.status(500).json({ msg: error.message });
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
      });
    } else {
      res.status(404).json({ msg: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;

      const updatedUser = await user.save();

      res.json({
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        isAdmin: updatedUser.isAdmin,
        isSecretaria: updatedUser.isSecretaria,
      });
    } else {
      res.status(404).json({ msg: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

// @desc    Change user password
// @route   PUT /api/users/change-password
// @access  Private
const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    if (!(await user.matchPassword(currentPassword))) {
      return res.status(401).json({ msg: 'Current password is incorrect' });
    }

    user.password = newPassword; // Mongoose pre-save hook will hash this
    await user.save();

    res.status(200).json({ msg: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ msg: error.message });
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
      return res.status(404).json({ msg: 'User not found' });
    }

    // Prevent admin from revoking their own admin access
    if (req.user._id.toString() === id && isAdmin === false) {
      return res.status(403).json({ msg: 'Cannot revoke your own admin access' });
    }

    if (typeof isAdmin === 'boolean') user.isAdmin = isAdmin;
    if (typeof isSecretaria === 'boolean') user.isSecretaria = isSecretaria;
    if (role) user.role = role;

    await user.save();
    res.json({ msg: 'User permissions updated', user: user.toObject({ getters: true, virtuals: false }) }); // Return updated user without password
  } catch (error) {
    res.status(500).json({ msg: error.message });
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
      return res.status(404).json({ msg: 'User not found' });
    }

    // Prevent admin from deleting themselves
    if (req.user._id.toString() === id) {
      return res.status(403).json({ msg: 'Cannot delete yourself' });
    }

    await user.deleteOne();
    res.status(200).json({ msg: 'User removed' });
  } catch (error) {
    res.status(500).json({ msg: error.message });
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

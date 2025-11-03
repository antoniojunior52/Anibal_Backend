// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    // ADICIONADO "Vice-Diretora"
    enum: ['Professor(a)', 'Secretaria', 'Coordenação', 'Diretora', 'Vice-Diretora', 'Admin'],
    default: 'Professor(a)',
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  isSecretaria: {
    type: Boolean,
    default: false,
  },
  // CAMPOS DE VERIFICAÇÃO ADICIONADOS
  isVerified: {
    type: Boolean,
    default: false,
  },
  verificationCode: {
    type: String,
  },
  verificationCodeExpire: {
    type: Date,
  },
  isProtected: {
    type: Boolean,
    default: false
  },  
  // CAMPOS DE RESET DE SENHA (EXISTENTES)
  resetPasswordToken: String,
  resetPasswordExpire: Date,
}, { timestamps: true });

// Hash da senha antes de salvar
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Metodo para comparar as senhas
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
// controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '1d', // Token expires in 1 day
  });
};

// @desc    Register a new user by admin
// @route   POST /api/auth/register-by-admin
// @access  Private (Admin only)
const registerUserByAdmin = async (req, res) => {
  const { name, email, password, role, isAdmin, isSecretaria } = req.body;

  try {
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    // Create user
    user = await User.create({
      name,
      email,
      password,
      role,
      isAdmin: isAdmin || false,
      isSecretaria: isSecretaria || false,
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isAdmin: user.isAdmin,
      isSecretaria: user.isSecretaria,
    });

  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

// @desc    Register a new user (public registration)
// @route   POST /api/auth/public-register
// @access  Public
const publicRegisterUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    // Create user with default role (Professor(a)) and no admin/secretaria permissions
    user = await User.create({
      name,
      email,
      password,
      role: 'Professor(a)',
      isAdmin: false,
      isSecretaria: false,
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });

  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check for user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    res.json({
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isAdmin: user.isAdmin,
        isSecretaria: user.isSecretaria,
      },
    });

  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

// @desc    Request password reset
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ msg: 'User with that email does not exist' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 3600000; // 1 hour

    await user.save();

    // Crie o URL de redefinição
    // Em desenvolvimento, aponte para a porta do frontend (ex: 3000)
    // Em produção, use o host do backend ou o domínio configurado
    const frontendBaseUrl = process.env.NODE_ENV === 'production'
      ? `${req.protocol}://${req.get('host')}` // Em produção, pode ser o mesmo host do backend ou um CDN
      : 'http://localhost:3000'; // Em desenvolvimento, a URL do seu React App (porta 3000)

    const resetUrl = `${frontendBaseUrl}/reset-password/${resetToken}`;
    const schoolName = "E.E Profº Anibal do Prado e Silva"; // Nome da sua escola
    // URL ABSOLUTO para o logótipo (substitua por um URL real do seu logótipo hospedado)
    const logoUrl = "https://i.imgur.com/your-actual-logo.jpg"; // EX: "https://seusite.com/logo.png"

    // Conteúdo HTML para o email
    const htmlMessage = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 20px auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #4455a3; color: white; padding: 20px; text-align: center;">
          <img src="${logoUrl}" alt="Logo da Escola" style="max-width: 80px; margin-bottom: 10px; border-radius: 50%;">
          <h1 style="margin: 0; font-size: 24px;">${schoolName}</h1>
        </div>
        <div style="padding: 30px;">
          <p>Olá,</p>
          <p>Você está recebendo este e-mail porque você (ou alguém) solicitou a redefinição da senha da sua conta no <strong>${schoolName}</strong>.</p>
          <p>Para redefinir sua senha, por favor, clique no botão abaixo:</p>
          <p style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #ec9c30; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: bold;">
              Redefinir Senha
            </a>
          </p>
          <p>Este link de redefinição de senha é válido por 1 hora.</p>
          <p>Se você não solicitou esta redefinição de senha, por favor, ignore este e-mail.</p>
          <p>Atenciosamente,<br>A Equipe ${schoolName}</p>
        </div>
        <div style="background-color: #f3f4f6; color: #777; padding: 15px; text-align: center; font-size: 12px;">
          <p>&copy; ${new Date().getFullYear()} ${schoolName}. Todos os direitos reservados.</p>
        </div>
      </div>
    `;

    // Send email (configure your nodemailer transporter)
    const transporter = nodemailer.createTransport({
      // Configure your email service here
      // Example for Gmail:
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USERNAME, // Your email
        pass: process.env.EMAIL_PASSWORD, // Your email password or app password
      },
      // Descomente e configure se estiver a usar um provedor SMTP diferente do Gmail
      /*
      host: 'smtp.example.com',
      port: 587,
      secure: false, // true for 465, false for other ports
      */
    });

    const mailOptions = {
      from: process.env.EMAIL_USERNAME,
      to: user.email,
      subject: 'Redefinição de Senha - ' + schoolName, // Assunto mais descritivo
      html: htmlMessage, // Enviar como HTML
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        user.save(); // Revert token if email fails
        return res.status(500).json({ msg: 'Email could not be sent' });
      }
      console.log('Email sent:', info.response);
      res.status(200).json({ msg: 'Email sent successfully' });
    });

  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

// @desc    Reset user password
// @route   PUT /api/auth/reset-password/:resetToken
// @access  Public
const resetPassword = async (req, res) => {
  const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

  try {
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ msg: 'Invalid or expired reset token' });
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({ msg: 'Password reset successful' });

  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

module.exports = {
  registerUserByAdmin,
  publicRegisterUser,
  loginUser,
  forgotPassword,
  resetPassword,
};

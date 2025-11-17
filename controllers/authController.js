// controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendVerificationEmail, sendResetPasswordEmail } = require('../utils/email'); 

// Gerar JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '1d', // Token expira em um dia
  });
};

// Função helper para gerar código de 6 dígitos
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// @desc    Registrar novo usuário e enviar e-mail de definição de senha
// @route   POST /api/auth/register-by-admin
// @access  Privado (Admin apenas)
const registerUserByAdmin = async (req, res) => {
  // 1. Obter dados do body
  const { name, email, role, isAdmin, isSecretaria } = req.body;

  try {
    // 2. Checar se o usuário já existe
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'Usuário já existe.' });
    }

    // 3. Preparar dados para o novo usuário
    
    // Gerar uma senha temporária aleatória (necessária para criar o user no BD)
    const tempPassword = crypto.randomBytes(20).toString('hex');

    // Gerar o token de redefinição de senha (lógica da forgotPassword)
    const resetToken = crypto.randomBytes(20).toString('hex');
    
    // Criar o hash do token para salvar no BD
    const hashedResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
      
    // Definir o tempo de expiração
    const resetExpire = Date.now() + 3600000; // 1 hora

    // 4. Criar o usuário no banco de dados
    user = await User.create({
      name,
      email,
      password: tempPassword, // Salva a senha temporária
      role,
      isAdmin: isAdmin || false,
      isSecretaria: isSecretaria || false,
      isVerified: true, // Usuário criado por admin já é considerado verificado
      resetPasswordToken: hashedResetToken, // Salva o token de reset
      resetPasswordExpire: resetExpire,     // Salva a expiração
    });

    // 5. Tentar enviar o e-mail de definição de senha
    try {
      // Envia o e-mail com o token *original* (NÃO o hash)
      await sendResetPasswordEmail(user.email, resetToken);

      // 6a. Sucesso total (Usuário criado E e-mail enviado)
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isAdmin: user.isAdmin,
        isSecretaria: user.isSecretaria,
        msg: 'Usuário criado. E-mail de definição de senha enviado com sucesso.',
      });

    } catch (emailError) {
      // 6b. Sucesso parcial (Usuário criado, mas e-mail falhou)
      console.error('Falha ao enviar e-mail de definição de senha após cadastro:', emailError);
      
      // O usuário foi criado, mas o e-mail falhou.
      // O status 207 (Multi-Status) indica um sucesso parcial.
      res.status(207).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        msg: 'Usuário criado com sucesso, mas falha ao enviar o e-mail. O usuário precisará usar a função "Esqueceu a senha" manualmente.',
      });
    }

  } catch (error) {
    // 7. Erro principal (Falha ao checar ou criar usuário no BD)
    res.status(500).json({ msg: error.message });
  }
};

// @desc    Register a new user (public registration)
// @route   POST /api/auth/public-register
// @access  Public
const publicRegisterUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    let user = await User.findOne({ email });

    // Se o usuário existe E não está verificado, apenas atualiza o código e reenvia
    if (user && !user.isVerified) {
      const code = generateVerificationCode();
      user.verificationCode = code;
      user.verificationCodeExpire = Date.now() + 90000; // 1.5 minutos (90000 ms)
      await user.save();
      await sendVerificationEmail(email, code);
      return res.status(200).json({ 
        msg: 'Usuário já registrado. Um novo código de verificação foi enviado.', 
        email: user.email 
      });
    }

    if (user && user.isVerified) {
      return res.status(400).json({ msg: 'Usuário já existe.' });
    }

    // Gerar código de verificação
    const code = generateVerificationCode();

    // Create user with default role and verification fields
    user = await User.create({
      name,
      email,
      password,
      role: 'Professor(a)',
      isAdmin: false,
      isSecretaria: false,
      isVerified: false,
      verificationCode: code,
      verificationCodeExpire: Date.now() + 90000, // 1.5 minutos (90000 ms)
    });

    // Enviar e-mail de verificação
    await sendVerificationEmail(email, code);

    res.status(201).json({
      msg: 'Registro bem-sucedido. Verifique seu e-mail para ativar sua conta.',
      email: user.email, // Retorna o e-mail para o frontend
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
      return res.status(400).json({ msg: 'Credenciais Inválidas' });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Credenciais Inválidas' });
    }

    if (!user.isVerified) {
      // Se não for verificado, GERA e ENVIA um NOVO código
      try {
        const code = generateVerificationCode();
        user.verificationCode = code;
        user.verificationCodeExpire = Date.now() + 90000; // 1.5 minutos
        await user.save();
        
        // Envia o e-mail
        await sendVerificationEmail(email, code);
        
        // Retorna o 401 como antes, mas agora o e-mail foi enviado
        return res.status(401).json({ 
          msg: 'Sua conta não está verificada. Um novo código foi enviado para o seu e-mail.',
          email: user.email,
          needsVerification: true 
        });
      } catch (emailError) {
        // Se o envio do e-mail falhar, informa o usuário.
        console.error('Erro ao reenviar e-mail de verificação no login:', emailError);
        return res.status(500).json({ msg: 'Sua conta não está verificada, mas falhamos ao enviar um novo código. Tente novamente mais tarde.' });
      }
    }

    // Se chegou aqui, está verificado e a senha está correta
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
      return res.status(404).json({ msg: 'Não existe usuário com esse e-mail.' });
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 3600000; // 1 hour (sem alteração)

    await user.save();

    try {
      await sendResetPasswordEmail(user.email, resetToken);
      res.status(200).json({ msg: 'Email enviado com sucesso' });
    } catch (emailError) {
      console.error('Erro ao enviar o email:', emailError);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save(); 
      return res.status(500).json({ msg: 'Email não pode ser enviado' });
    }

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
      return res.status(400).json({ msg: 'Token inválido ou expirado.' });
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({ msg: 'Senha alterada com sucesso' });

  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

// @desc    Verify user email
// @route   POST /api/auth/verify-email
// @access  Public
const verifyEmail = async (req, res) => {
  const { email, code } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ msg: 'Usuário não encontrado.' });
    }

    if (user.verificationCode !== code) {
      return res.status(400).json({ msg: 'Código de verificação inválido.' });
    }

    if (user.verificationCodeExpire < Date.now()) {
      return res.status(400).json({ msg: 'Código expirado. Solicite um novo.' });
    }

    user.isVerified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpire = undefined;
    await user.save();

    res.status(200).json({ msg: 'E-mail verificado com sucesso!' });

  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

// @desc    Check if email exists
// @route   POST /api/auth/check-email
// @access  Public (ou pode ser 'protect' se quiser)
const checkEmail = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user) {
      // Retorna 400 (Bad Request) se o e-mail já estiver em uso
      return res.status(400).json({ msg: 'Este e-mail já está em uso.' });
    }

    // Retorna 200 (OK) se o e-mail estiver disponível
    res.status(200).json({ msg: 'E-mail disponível.' });

  } catch (error) {
    res.status(500).json({ msg: 'Erro ao verificar e-mail.' });
  }
};


module.exports = {
  registerUserByAdmin,
  publicRegisterUser,
  loginUser,
  forgotPassword,
  resetPassword,
  verifyEmail,
  checkEmail,
};
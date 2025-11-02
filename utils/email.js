// utils/email.js
const nodemailer = require('nodemailer');

// 1. CONFIGURAÇÃO DO NODEMAILER (movida do authController)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USERNAME, 
    pass: process.env.EMAIL_PASSWORD, 
  },
});

const schoolName = "E.E Profº Anibal do Prado e Silva";

/**
 * Envia um e-mail de verificação com código de 6 dígitos
 * @param {string} email - O e-mail do destinatário
 * @param {string} code - O código de 6 dígitos
 */
exports.sendVerificationEmail = async (email, code) => {
  const htmlMessage = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 20px auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #4455a3; color: white; padding: 20px; text-align: center;">
        <h1 style="margin: 0; font-size: 24px;">${schoolName}</h1>
      </div>
      <div style="padding: 30px;">
        <p>Olá,</p>
        <p>Obrigado por se registrar no portal da <strong>${schoolName}</strong>.</p>
        <p>Use o código abaixo para verificar seu endereço de e-mail:</p>
        <p style="text-align: center; margin: 30px 0; font-size: 36px; font-weight: bold; letter-spacing: 5px; color: #4455a3;">
          ${code}
        </p>
        <p>Este código é válido por 1 minuto.</p>
        <p>Se você não se registrou, por favor, ignore este e-mail.</p>
        <p>Atenciosamente,<br>A Equipe ${schoolName}</p>
      </div>
      <div style="background-color: #f3f4f6; color: #777; padding: 15px; text-align: center; font-size: 12px;">
        <p>&copy; ${new Date().getFullYear()} ${schoolName}. Todos os direitos reservados.</p>
      </div>
    </div>
  `;

  const mailOptions = {
    from: process.env.EMAIL_USERNAME,
    to: email,
    subject: `Seu Código de Verificação - ${schoolName}`,
    html: htmlMessage,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('E-mail de verificação enviado:', info.response);
  } catch (error) {
    console.error('Erro ao enviar e-mail de verificação:', error);
    // Lança o erro para que o controller possa lidar com ele
    throw new Error('Email não pode ser enviado');
  }
};

/**
 * Envia um e-mail de redefinição de senha
 * @param {string} email - O e-mail do destinatário
 * @param {string} token - O token de redefinição
 */
exports.sendResetPasswordEmail = async (email, token) => {
  const frontendBaseUrl = process.env.NODE_ENV === 'production'
    ? (process.env.FRONTEND_URL || 'https://seu-site.com') // Adicione FRONTEND_URL ao seu .env
    : 'http://localhost:3000'; 

  const resetUrl = `${frontendBaseUrl}/reset-password/${token}`;

  const htmlMessage = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 20px auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #4455a3; color: white; padding: 20px; text-align: center;">
        <h1 style="margin: 0; font-size: 24px;">${schoolName}</h1>
      </div>
      <div style="padding: 30px;">
        <p>Olá,</p>
        <p>Você está recebendo este e-mail porque você solicitou a redefinição da senha da sua conta no <strong>${schoolName}</strong>.</p>
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

  const mailOptions = {
    from: process.env.EMAIL_USERNAME,
    to: email,
    subject: 'Redefinição de Senha - ' + schoolName,
    html: htmlMessage,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email de redefinição enviado:', info.response);
  } catch (error) {
    console.error('Erro ao enviar o email de redefinição:', error);
    throw new Error('Email não pode ser enviado');
  }
};
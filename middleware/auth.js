// middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('express-async-handler');

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Encontre e anexe o objeto de usuário completo à requisição
      req.user = await User.findById(decoded.id).select('-password');
      next();
    } catch (error) {
      res.status(401);
      throw new Error('Não autorizado, token inválido.');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Não autorizado, nenhum token fornecido.');
  }
});

const authorize = (...roles) => (req, res, next) => {
  // Assumindo que req.user é o ID do usuário do middleware protect
  User.findById(req.user)
    .then(user => {
      if (!user) {
        return res.status(404).json({ msg: 'Usuário não encontrado.' });
      }

      let isAuthorized = false;
      if (roles.includes('admin') && user.isAdmin) {
        isAuthorized = true;
      }
      if (roles.includes('secretaria') && user.isSecretaria) {
        isAuthorized = true;
      }
      // Adicione outros papéis conforme necessário, ex: 'professor'

      if (!isAuthorized) {
        return res.status(403).json({ msg: 'Não autorizado a acessar esta rota.' });
      }
      req.user = user; // Anexa o objeto de usuário completo à requisição
      next();
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ msg: 'Erro do servidor durante a autorização.' });
    });
};

module.exports = { protect, authorize };

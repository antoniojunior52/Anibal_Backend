// middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach user to the request
      req.user = decoded.id; // O payload do token é o ID do usuário
      next();
    } catch (error) {
      res.status(401).json({ msg: 'Não autorizado, token inválido.' });
    }
  }

  if (!token) {
    res.status(401).json({ msg: 'Não autorizado, nenhum token fornecido.' });
  }
};

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

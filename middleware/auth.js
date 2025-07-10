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
      req.user = decoded.id; // The payload of the token is the user ID
      next();
    } catch (error) {
      res.status(401).json({ msg: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ msg: 'Not authorized, no token' });
  }
};

const authorize = (...roles) => (req, res, next) => {
  // Assuming req.user is the user ID from the protect middleware
  User.findById(req.user)
    .then(user => {
      if (!user) {
        return res.status(404).json({ msg: 'User not found' });
      }

      let isAuthorized = false;
      if (roles.includes('admin') && user.isAdmin) {
        isAuthorized = true;
      }
      if (roles.includes('secretaria') && user.isSecretaria) {
        isAuthorized = true;
      }
      // Add other roles as needed, e.g., 'professor'

      if (!isAuthorized) {
        return res.status(403).json({ msg: 'Not authorized to access this route' });
      }
      req.user = user; // Attach the full user object to the request
      next();
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ msg: 'Server error during authorization' });
    });
};

module.exports = { protect, authorize };

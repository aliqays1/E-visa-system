const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      next();
    } catch (error) {
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }
  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const authOptional = async (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
    } catch (error) {
      // Token invalid or expired, proceed without user
    }
  }
  next();
};

const officerOnly = (req, res, next) => {
  if (req.user && req.user.role === 'officer') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as an officer' });
  }
};
const auditorOnly = (req, res, next) => {
  if (req.user && req.user.role === 'auditor') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as an auditor' });
  }
};

module.exports = { protect, officerOnly, auditorOnly, authOptional };

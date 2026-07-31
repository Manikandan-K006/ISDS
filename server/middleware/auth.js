const jwt = require('jsonwebtoken');
const prisma = require('../prisma');
const config = require('../config/env');

const verifyAndLoad = async (token) => {
  const decoded = jwt.verify(token, config.jwtSecret);
  const user = await prisma.user.findUnique({
    where: { id: decoded.id },
    select: { id: true, email: true, name: true, role: true, isActive: true, profilePhoto: true, tokenVersion: true },
  });
  if (!user || !user.isActive) {
    const err = new Error('User not found or deactivated');
    err.status = 401;
    throw err;
  }
  if (decoded.v !== undefined && decoded.v !== user.tokenVersion) {
    const err = new Error('Session has been revoked');
    err.status = 401;
    throw err;
  }
  return user;
};

const authenticate = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    const token = header.split(' ')[1];
    const user = await verifyAndLoad(token);
    req.user = user;
    req.userId = user.id;
    req.userRole = user.role;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired', code: 'TOKEN_EXPIRED' });
    }
    return res.status(err.status || 401).json({ error: err.message || 'Invalid token' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.userRole)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};

const optionalAuth = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (header && header.startsWith('Bearer ')) {
      const token = header.split(' ')[1];
      const user = await verifyAndLoad(token);
      req.user = user;
      req.userId = user.id;
      req.userRole = user.role;
    }
  } catch (err) {
    // Ignore auth errors for optional auth
  }
  next();
};

module.exports = { authenticate, authorize, optionalAuth };

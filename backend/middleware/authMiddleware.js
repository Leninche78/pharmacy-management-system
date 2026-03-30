const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'Access Denied: No Token Provided!' });

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET || 'supersecretkey_change_in_production');
    req.user = verified;
    next();
  } catch (error) {
    res.status(403).json({ message: 'Invalid Token' });
  }
};

const authorizeRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access Denied: You do not have permission to perform this action.' });
    }
    next();
  };
};

module.exports = { authenticateToken, authorizeRole };

const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.SECRET_KEY || '4a6f732dc2eae26cfae9d12345678abcdef90abcdef1234567890abcdef1234';

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(403).send({ message: 'No token provided' });
  }

  // Extract token prefix (Bearer) and token value
  const tokenValue = token.split(' ')[1];

  jwt.verify(tokenValue, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: 'Unauthorized: Invalid token' });
    }
    req.user = decoded; // Set decoded user info in request object
    next();
  });
};

module.exports = { verifyToken };

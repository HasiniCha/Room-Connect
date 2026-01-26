const jwt = require('jsonwebtoken');

exports.authenticateSocket = (socket, next) => {
  try {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }
    
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return next(new Error('Authentication error: Invalid token'));
      }
      
  
      socket.user = decoded;
      next();
    });
  } catch (error) {
    next(new Error('Authentication error'));
  }
};
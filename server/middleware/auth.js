import jwt from 'jsonwebtoken';

// Middleware to verify JWT token
export const auth = (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    // Check if token exists
    if (!token) {
      return res.status(401).json({ message: 'No authentication token, access denied' });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Set user ID in request
    req.userId = decoded.id;
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token is invalid or expired' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Optional auth middleware - doesn't require authentication but sets userId if token is valid
export const optionalAuth = (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    // If token exists, verify it
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.id;
      } catch (tokenError) {
        // If token is invalid, just continue without setting userId
        console.error('Invalid token in optionalAuth:', tokenError);
      }
    }
    
    next();
  } catch (error) {
    console.error('Optional auth middleware error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
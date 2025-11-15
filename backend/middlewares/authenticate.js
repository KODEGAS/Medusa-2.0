import logger from '../utils/logger.js';
import jwt from 'jsonwebtoken';

/**
 * Authentication middleware - verifies JWT token from cookie or Authorization header
 * Attaches req.user = { teamId, round, ... } on success
 */
export default function authenticate(req, res, next) {
  try {
    let token = null;
    
    // 1. Check HttpOnly cookie first (preferred)
    if (req.cookies && req.cookies.medusa_token) {
      token = req.cookies.medusa_token;
    }
    
    // 2. Fallback to Authorization header (for API clients)
    if (!token && req.headers.authorization) {
      const authHeader = req.headers.authorization;
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        error: 'Authentication required. Please log in.' 
      });
    }
    
    // Verify JWT
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    
    // Attach user info to request
    req.user = payload; // { teamId, round, iat, exp }
    
    return next();
  } catch (error) {
    logger.error('Authentication error:', error.message);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        error: 'Session expired. Please log in again.' 
      });
    }
    
    return res.status(401).json({ 
      success: false, 
      error: 'Invalid authentication token.' 
    });
  }
}


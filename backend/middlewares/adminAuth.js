import jwt from 'jsonwebtoken';
import getRealIP from '../utils/getRealIP.js';

const adminAuth = (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      const clientIP = getRealIP(req);
      console.warn(`⚠️ Admin access denied - No token provided from IP: ${clientIP}`);
      return res.status(401).json({ 
        error: 'Admin access denied. No token provided.' 
      });
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user is admin
    if (decoded.role !== 'admin') {
      const clientIP = getRealIP(req);
      console.warn(`Access denied - Non-admin role attempted: ${decoded.role} from IP: ${clientIP}`);
      return res.status(403).json({ 
        error: 'Access denied. Admin privileges required.' 
      });
    }

    // Check token age for additional security
    const tokenAge = Date.now() - (decoded.loginTime || 0);
    const maxTokenAge = 8 * 60 * 60 * 1000; // 8 hours in milliseconds
    
    if (decoded.loginTime && tokenAge > maxTokenAge) {
    console.warn(`Admin token expired - Age: ${Math.floor(tokenAge / 1000 / 60)} minutes`);
    return res.status(401).json({ 
        error: 'Admin token expired. Please login again.' 
    });
    }

    // Attach admin info to request
    req.admin = decoded;
    next();

} catch (error) {
    console.error('Admin auth error:', error.message);
    
    if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({ 
        error: 'Invalid admin token' 
    });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Admin token expired. Please login again.' 
      });
    }

    res.status(500).json({ 
      error: 'Admin authentication failed' 
    });
  }
};

export default adminAuth;

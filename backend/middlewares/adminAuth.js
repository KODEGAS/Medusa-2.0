import jwt from 'jsonwebtoken';

const adminAuth = (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.warn(`Admin access denied - No token provided from IP: ${req.ip}`);
      return res.status(401).json({ 
        error: 'Admin access denied. No token provided.' 
      });
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user is admin
    if (decoded.role !== 'admin') {
      console.warn(`Access denied - Non-admin role attempted: ${decoded.role} from IP: ${req.ip}`);
      return res.status(403).json({ 
        error: 'Access denied. Admin privileges required.' 
      });
    }

    // Optional: Check token age for additional security
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

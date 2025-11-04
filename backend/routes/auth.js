import express from 'express';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Rate limiter: 5 verification attempts per minute per IP
const authLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5,
  message: { 
    error: 'Too many authentication attempts. Please try again later.',
    retryAfter: '1 minute'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Store valid API keys (in production, use database)
const VALID_API_KEYS = {
  'MEDUSA_R1_2025': {
    round: 1,
    name: 'Round 1 Access',
    active: true,
    expiresAt: null // Set expiration if needed
  }
  // Add more API keys as needed
};

// Verify API key endpoint
router.post('/verify', authLimiter, async (req, res) => {
  try {
    const { apiKey, teamId } = req.body;

    // Validate inputs
    if (!apiKey || typeof apiKey !== 'string') {
      return res.status(400).json({ 
        error: 'API Key is required' 
      });
    }

    if (!teamId || typeof teamId !== 'string') {
      return res.status(400).json({ 
        error: 'Team ID is required' 
      });
    }

    // Check if API key exists and is valid
    const keyInfo = VALID_API_KEYS[apiKey];
    
    if (!keyInfo) {
      return res.status(401).json({ 
        error: 'Invalid API Key',
        authenticated: false
      });
    }

    if (!keyInfo.active) {
      return res.status(403).json({ 
        error: 'This API Key has been deactivated',
        authenticated: false
      });
    }

    // Check expiration if set
    if (keyInfo.expiresAt && new Date() > new Date(keyInfo.expiresAt)) {
      return res.status(403).json({ 
        error: 'This API Key has expired',
        authenticated: false
      });
    }

    // Log successful authentication (optional - store in database)
    console.log(`Team ${teamId} authenticated for ${keyInfo.name} at ${new Date().toISOString()}`);

    // Return success
    res.json({ 
      success: true,
      authenticated: true,
      round: keyInfo.round,
      message: `Access granted to ${keyInfo.name}`,
      teamId: teamId
    });

  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ 
      error: 'Failed to verify API Key. Please try again later.',
      authenticated: false
    });
  }
});

// Check if a team is authenticated (optional endpoint)
router.get('/check/:teamId', async (req, res) => {
  try {
    const { teamId } = req.params;
    
    // In production, check against database of authenticated sessions
    // For now, just return that they need to authenticate
    
    res.json({ 
      authenticated: false,
      message: 'Please authenticate with your API key'
    });

  } catch (error) {
    console.error('Check auth error:', error);
    res.status(500).json({ 
      error: 'Failed to check authentication status'
    });
  }
});

// List available rounds (public endpoint)
router.get('/rounds', async (req, res) => {
  try {
    const rounds = Object.values(VALID_API_KEYS)
      .filter(key => key.active)
      .map(key => ({
        round: key.round,
        name: key.name,
        requiresAuth: true
      }));

    res.json({ 
      success: true,
      rounds 
    });

  } catch (error) {
    console.error('List rounds error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch rounds'
    });
  }
});

export default router;

import express from 'express';
import rateLimit from 'express-rate-limit';
import jwt from 'jsonwebtoken';
import Team from '../models/Team.js';

const router = express.Router();

// Rate limiter: 15 verification attempts per 5 minutes per team
// Tracks by IP + Team ID to handle shared networks (mobile carriers, universities)
const authLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes (more forgiving)
  max: 15,                  // 15 attempts per team (allows typos)
  
  // Track by IP + Team ID combination
  // This prevents false blocks when teams share IPs (CGNAT, same campus, etc.)
  keyGenerator: (req) => {
    const ip = req.ip;
    const teamId = req.body.teamId || 'unknown';
    return `${ip}-${teamId}`;
  },
  
  message: { 
    error: 'Too many authentication attempts for this team. Please try again in 5 minutes.',
    retryAfter: '5 minutes'
  },
  
  standardHeaders: true,
  legacyHeaders: false,
  
  // Don't count successful logins against the limit
  skipSuccessfulRequests: true,
  
  // Log when rate limit is hit
  handler: (req, res) => {
    const ip = req.ip;
    const teamId = req.body.teamId || 'unknown';
    const apiKey = req.body.apiKey ? '***' + req.body.apiKey.slice(-4) : 'none';
    
    console.error(`🚨 RATE LIMIT HIT - Too many authentication attempts`);
    console.error(`   Team ID: ${teamId}`);
    console.error(`   IP Address: ${ip}`);
    console.error(`   API Key (last 4): ${apiKey}`);
    console.error(`   Timestamp: ${new Date().toISOString()}`);
    console.error(`   User-Agent: ${req.get('user-agent') || 'unknown'}`);
    
    res.status(429).json({
      error: 'Too many authentication attempts for this team. Please try again in 5 minutes.',
      retryAfter: '5 minutes',
      teamId: teamId
    });
  }
});

// Load API keys from environment variables for security
const VALID_API_KEYS = {
  [process.env.ROUND1_API_KEY]: {
    round: 1,
    name: 'Round 1 Access',
    active: true,
    expiresAt: null 
  },
  [process.env.ROUND2_API_KEY]: {
    round: 2,
    name: 'Round 2 Access',
    active: true,
    expiresAt: null
  }
};

// Validate required API key environment variables
if (!process.env.ROUND1_API_KEY || !process.env.ROUND2_API_KEY) {
  console.error('❌ Missing required API key environment variables: ROUND1_API_KEY or ROUND2_API_KEY');
  console.error('💡 Add them to your .env file');
}

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
      // Log failed authentication - Invalid API Key
      console.warn(`⚠️  FAILED AUTH - Invalid API Key`);
      console.warn(`   Team ID: ${teamId}`);
      console.warn(`   IP Address: ${req.ip}`);
      console.warn(`   API Key (last 4): ***${apiKey.slice(-4)}`);
      console.warn(`   Timestamp: ${new Date().toISOString()}`);
      
      return res.status(401).json({ 
        error: 'Invalid API Key',
        authenticated: false
      });
    }

    if (!keyInfo.active) {
      // Log failed authentication - Deactivated API Key
      console.warn(`⚠️  FAILED AUTH - Deactivated API Key`);
      console.warn(`   Team ID: ${teamId}`);
      console.warn(`   IP Address: ${req.ip}`);
      console.warn(`   Round: ${keyInfo.round}`);
      console.warn(`   Timestamp: ${new Date().toISOString()}`);
      
      return res.status(403).json({ 
        error: 'This API Key has been deactivated',
        authenticated: false
      });
    }

    // Check expiration if set
    if (keyInfo.expiresAt && new Date() > new Date(keyInfo.expiresAt)) {
      // Log failed authentication - Expired API Key
      console.warn(`⚠️  FAILED AUTH - Expired API Key`);
      console.warn(`   Team ID: ${teamId}`);
      console.warn(`   IP Address: ${req.ip}`);
      console.warn(`   Round: ${keyInfo.round}`);
      console.warn(`   Expired At: ${keyInfo.expiresAt}`);
      console.warn(`   Timestamp: ${new Date().toISOString()}`);
      
      return res.status(403).json({ 
        error: 'This API Key has expired',
        authenticated: false
      });
    }

    // Validate Team ID against database
    const team = await Team.findOne({ teamId: teamId.trim() });
    
    if (!team) {
      // Log failed authentication - Invalid Team ID
      console.warn(`⚠️  FAILED AUTH - Invalid Team ID`);
      console.warn(`   Team ID: ${teamId}`);
      console.warn(`   IP Address: ${req.ip}`);
      console.warn(`   Round: ${keyInfo.round}`);
      console.warn(`   API Key Valid: Yes`);
      console.warn(`   Timestamp: ${new Date().toISOString()}`);
      
      return res.status(401).json({ 
        error: 'Invalid Team ID. Please check your Team ID and try again.',
        authenticated: false
      });
    }

    if (!team.isActive) {
      // Log failed authentication - Deactivated Team
      console.warn(`⚠️  FAILED AUTH - Deactivated Team`);
      console.warn(`   Team ID: ${teamId}`);
      console.warn(`   Team Name: ${team.teamName}`);
      console.warn(`   University: ${team.university}`);
      console.warn(`   IP Address: ${req.ip}`);
      console.warn(`   Round: ${keyInfo.round}`);
      console.warn(`   Timestamp: ${new Date().toISOString()}`);
      
      return res.status(403).json({ 
        error: 'Your team has been deactivated. Please contact organizers.',
        authenticated: false
      });
    }

    // Log successful authentication
    console.log(`✅ SUCCESSFUL AUTH - Team ${teamId} (${team.teamName} - ${team.university}) authenticated for ${keyInfo.name} at ${new Date().toISOString()}`);

    // Issue JWT token
    const payload = {
      teamId: team.teamId,
      teamName: team.teamName,
      university: team.university,
      round: keyInfo.round,
      apiKey: apiKey
    };
    
    const token = jwt.sign(payload, process.env.JWT_SECRET, { 
      expiresIn: '6h' // Token expires after 6 hours
    });

    // Set HttpOnly secure cookie (for same-domain setups)
    res.cookie('medusa_token', token, {
      httpOnly: true,
      secure: true, // HTTPS only
      sameSite: 'none', // Allow cross-site
      maxAge: 6 * 60 * 60 * 1000, // 6 hours
    });

    // ALSO return token in response body for cross-domain usage
    // Frontend will store in localStorage and send via Authorization header
    res.json({ 
      success: true,
      authenticated: true,
      token: token, // ✅ Return token for Authorization header usage
      round: keyInfo.round,
      message: `Access granted to ${keyInfo.name}`,
      teamId: team.teamId,
      teamName: team.teamName,
      university: team.university,
      expiresIn: '6h'
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

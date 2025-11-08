import express from 'express';
import FlagSubmission from '../models/FlagSubmission.js';
import RoundSession from '../models/RoundSession.js';
import rateLimit from 'express-rate-limit';
import authenticate from '../middlewares/authenticate.js';
import getRealIP from '../utils/getRealIP.js';
import { calculatePoints } from '../utils/calculatePoints.js';

const router = express.Router();

// CORRECT FLAG for Round 1
const CORRECT_FLAG = 'MEDUSA{5t3g4n0_1n_7h3_d33p_4bY55_0f_7h3_0c34n_15_4_7r345ur3}';

// Rate limiter: 10 submissions per 5 minutes per IP (global protection)
const ipRateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 15, // Limit each IP to 15 requests per windowMs
  message: { 
    error: 'Too many flag submissions from this IP. Please try again later.',
    retryAfter: '5 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Per-team rate limiter: 10 submissions per 5 minutes per team
const teamRateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10, // Limit each team to 10 submissions per windowMs
  keyGenerator: (req) => {
    // Use teamId from JWT token as the key
    return req.user?.teamId || req.ip;
  },
  message: { 
    error: 'Your team has exceeded the submission limit. Please try again later.',
    retryAfter: '5 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipFailedRequests: false, // Count failed requests too
});

// Validation middleware (now teamId comes from JWT, not body)
const validateFlagSubmission = (req, res, next) => {
  const { flag } = req.body;

  // Validate flag
  if (!flag || typeof flag !== 'string' || flag.trim().length === 0) {
    return res.status(400).json({ 
      error: 'Flag is required and must be a valid string' 
    });
  }

  if (flag.length < 5) {
    return res.status(400).json({ 
      error: 'Flag is too short (minimum 5 characters)' 
    });
  }

  if (flag.length > 200) {
    return res.status(400).json({ 
      error: 'Flag is too long (max 200 characters)' 
    });
  }

  // Sanitize input
  req.body.flag = flag.trim();

  next();
};

// Submit flag endpoint - now protected with JWT auth
router.post('/submit', authenticate, ipRateLimiter, teamRateLimiter, validateFlagSubmission, async (req, res) => {
  try {
    const teamId = req.user.teamId; // Read from JWT token (secure)
    const { flag } = req.body;
    const ipAddress = getRealIP(req);
    const userAgent = req.get('user-agent');

    // Check how many submissions this team has made
    const submissionCount = await FlagSubmission.countDocuments({ teamId });

    // Limit to 2 submissions per team
    if (submissionCount >= 2) {
      return res.status(403).json({ 
        error: 'Maximum submission limit reached. Your team can only submit 2 flags.',
        submissionCount: submissionCount,
        maxSubmissions: 2
      });
    }

    // Check for duplicate submission
    const existingSubmission = await FlagSubmission.findOne({ 
      teamId, 
      flag 
    });

    if (existingSubmission) {
      return res.status(409).json({ 
        error: 'This flag has already been submitted by your team',
        submittedAt: existingSubmission.submittedAt
      });
    }

    // Determine if this is the second submission (point deduction applies)
    const isSecondSubmission = submissionCount === 1;
    const pointDeduction = isSecondSubmission ? 0.25 : 0; // 25% deduction on second attempt

    // Check if flag is correct
    const isCorrect = flag.trim() === CORRECT_FLAG;
    
    // Get team's round start time for point calculation
    let roundStartTime = new Date(); // Default to now if no session found
    try {
      const roundSession = await RoundSession.findOne({ teamId, round: 1 });
      if (roundSession && roundSession.startTime) {
        roundStartTime = roundSession.startTime;
      }
    } catch (err) {
      console.warn('Could not fetch round start time for team', teamId);
    }
    
    // Calculate points if correct
    const points = isCorrect 
      ? calculatePoints(roundStartTime, new Date(), submissionCount + 1)
      : 0;

    const flagSubmission = new FlagSubmission({
      teamId,
      flag,
      ipAddress,
      userAgent,
      isCorrect: isCorrect,
      verified: true, // Auto-verify since we're checking against correct flag
      verifiedAt: new Date(),
      attemptNumber: submissionCount + 1,
      pointDeduction: pointDeduction,
      points: points
    });

    await flagSubmission.save();

    // Log submission for audit trail
    console.log(`Flag submitted by team ${teamId} (Attempt ${submissionCount + 1}/2) - ${isCorrect ? '✅ CORRECT' : '❌ INCORRECT'} - ${points} points from IP ${ipAddress} at ${new Date().toISOString()}`);

    // Prepare response with submission info
    const response = {
      success: true,
      message: isCorrect 
        ? '🎉 Congratulations! Your flag is correct!' 
        : '❌ Incorrect flag. Please try again.',
      submissionId: flagSubmission._id,
      submittedAt: flagSubmission.submittedAt,
      teamId: teamId,
      attemptNumber: submissionCount + 1,
      remainingAttempts: 2 - (submissionCount + 1),
      isCorrect: isCorrect,
      points: points,
      warning: !isCorrect && isSecondSubmission 
        ? 'This was your final submission! No more attempts remaining.' 
        : !isCorrect && submissionCount === 0
        ? 'You have 1 attempt remaining. Your second submission will have a 25% point deduction.'
        : undefined
    };

    res.status(201).json(response);

  } catch (error) {
    console.error('Flag submission error:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(409).json({ 
        error: 'This flag has already been submitted' 
      });
    }

    res.status(500).json({ 
      error: 'Failed to submit flag. Please try again later.' 
    });
  }
});

// Get submissions for a team - protected, teams can only see their own
router.get('/submissions/:teamId', authenticate, async (req, res) => {
  try {
    const { teamId } = req.params;
    const requestingTeamId = req.user.teamId;

    // Teams can only view their own submissions (unless admin - future enhancement)
    if (teamId !== requestingTeamId) {
      return res.status(403).json({ 
        error: 'You can only view your own team\'s submissions' 
      });
    }

    const submissions = await FlagSubmission.find({ teamId })
      .sort({ submittedAt: -1 })
      .select('-ipAddress -userAgent') // Hide sensitive info
      .limit(50);

    res.json({ 
      success: true,
      count: submissions.length,
      submissions 
    });

  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({ 
      error: 'Failed to fetch submissions' 
    });
  }
});

// Get submission statistics (optional - for leaderboard)
router.get('/stats', async (req, res) => {
  try {
    const totalSubmissions = await FlagSubmission.countDocuments();
    const verifiedSubmissions = await FlagSubmission.countDocuments({ verified: true });
    const correctSubmissions = await FlagSubmission.countDocuments({ isCorrect: true });

    // Get top teams by correct submissions
    const topTeams = await FlagSubmission.aggregate([
      { $match: { isCorrect: true } },
      { 
        $group: { 
          _id: '$teamId', 
          correctFlags: { $sum: 1 },
          totalPoints: { $sum: '$points' }
        } 
      },
      { $sort: { totalPoints: -1, correctFlags: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      stats: {
        totalSubmissions,
        verifiedSubmissions,
        correctSubmissions,
        topTeams
      }
    });

  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ 
      error: 'Failed to fetch statistics' 
    });
  }
});

export default router;

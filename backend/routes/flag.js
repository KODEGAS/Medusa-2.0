import express from 'express';
import mongoose from 'mongoose';
import FlagSubmission from '../models/FlagSubmission.js';
import rateLimit from 'express-rate-limit';
import authenticate from '../middlewares/authenticate.js';
import getRealIP from '../utils/getRealIP.js';
import { calculatePoints } from '../utils/calculatePoints.js';

const router = express.Router();

// Round 1 Flag - with proper validation
const CORRECT_FLAG_R1 = (() => {
  const flag = process.env.ROUND1_FLAG;
  if (!flag || flag.trim() === '') {
    throw new Error('Missing ROUND1_FLAG environment variable');
  }
  console.log('✅ ROUND1_FLAG loaded successfully');
  return flag.trim();
})();

// Round 2 Flags - with proper validation
const CORRECT_FLAGS_R2 = {
  android: (() => {
    const flag = process.env.ROUND2_ANDROID_FLAG;
    if (!flag || flag.trim() === '') {
      throw new Error('Missing ROUND2_ANDROID_FLAG environment variable');
    }
    console.log('✅ ROUND2_ANDROID_FLAG loaded successfully');
    return flag.trim();
  })(),
  pwnUser: (() => {
    const flag = process.env.ROUND2_PWN_USER_FLAG;
    if (!flag || flag.trim() === '') {
      throw new Error('Missing ROUND2_PWN_USER_FLAG environment variable');
    }
    console.log('✅ ROUND2_PWN_USER_FLAG loaded successfully');
    return flag.trim();
  })(),
  pwnRoot: (() => {
    const flag = process.env.ROUND2_PWN_ROOT_FLAG;
    if (!flag || flag.trim() === '') {
      throw new Error('Missing ROUND2_PWN_ROOT_FLAG environment variable');
    }
    console.log('✅ ROUND2_PWN_ROOT_FLAG loaded successfully');
    return flag.trim();
  })()
};

// Flag validation with timing attack prevention
const secureCompare = (a, b) => {
  if (typeof a !== 'string' || typeof b !== 'string') {
    return false;
  }
  
  // Ensure both strings are same length to prevent length-based attacks
  const aLen = Buffer.byteLength(a);
  const bLen = Buffer.byteLength(b);
  
  if (aLen !== bLen) {
    return false;
  }
  
  // Constant-time comparison to prevent timing attacks
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  
  let result = 0;
  for (let i = 0; i < aLen; i++) {
    result |= bufA[i] ^ bufB[i];
  }
  
  return result === 0;
};

// GLOBAL COMPETITION START TIME - November 8, 2025 at 19:00:00 IST
const GLOBAL_COMPETITION_START = new Date('2025-11-08T19:00:00+05:30');

// ROUND 2 START TIME - Set this to when Round 2 actually starts
const ROUND_2_START = new Date('2025-11-09T10:00:00+05:30'); // Adjust this date/time as needed

// Helper function to get round start time from settings or fallback to constants
async function getRoundStartTime(round) {
  try {
    const Settings = (await import('../models/Settings.js')).default;
    const key = round === 2 ? 'round2_start_time' : 'round1_start_time';
    const setting = await Settings.findOne({ key });
    if (setting && setting.value) {
      return new Date(setting.value);
    }
  } catch (error) {
    console.warn(`Failed to get ${round === 2 ? 'Round 2' : 'Round 1'} start time from settings, using constant`);
  }
  // Fallback to constants
  return round === 2 ? ROUND_2_START : GLOBAL_COMPETITION_START;
}

// Rate limiter: 20 submissions per 5 minutes per IP+Team combination
// Prevents false blocks when teams share IPs (mobile networks, same campus)
const ipRateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 20, // 20 requests per window (more forgiving)
  
  // Track by IP + Team ID to handle shared networks
  keyGenerator: (req) => {
    const ip = req.ip;
    const teamId = req.user?.teamId || 'unauthenticated';
    return `${ip}-${teamId}`;
  },
  
  message: { 
    error: 'Too many flag submissions from your team. Please try again later.',
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
  const { flag, round, challengeType } = req.body;

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

  // Validate flag format based on challenge type
  // Android and Round 1: MEDUSA{...}
  // PWN challenges: HashX{...}
  const isPwnChallenge = challengeType === 'pwn-user' || challengeType === 'pwn-root';
  const isAndroidOrRound1 = round === 1 || challengeType === 'android';
  
  if (isAndroidOrRound1) {
    // Validate MEDUSA{...} format
    if (!/^MEDUSA\{[A-Za-z0-9_\-!@#$%^&*()+={}[\]:;"'<>,.?/\\|`~ ]+\}$/i.test(flag.trim())) {
      return res.status(400).json({ 
        error: 'Invalid flag format. Android flag must be in the format: MEDUSA{...}' 
      });
    }
  } else if (isPwnChallenge) {
    // Validate HashX{...} format
    if (!/^HashX\{[A-Za-z0-9_\-!@#$%^&*()+={}[\]:;"'<>,.?/\\|`~ ]+\}$/i.test(flag.trim())) {
      return res.status(400).json({ 
        error: 'Invalid flag format. PWN challenge flags must be in the format: HashX{...}' 
      });
    }
  }

  // Validate round
  if (round && (typeof round !== 'number' || ![1, 2].includes(round))) {
    return res.status(400).json({ 
      error: 'Invalid round number. Must be 1 or 2' 
    });
  }

  // For Round 2, validate challengeType
  if (round === 2) {
    if (!challengeType || !['android', 'pwn-user', 'pwn-root'].includes(challengeType)) {
      return res.status(400).json({ 
        error: 'For Round 2, challengeType must be "android", "pwn-user", or "pwn-root"' 
      });
    }
  }

  // Sanitize input
  req.body.flag = flag.trim();

  next();
};

// Submit flag endpoint - now protected with JWT auth
router.post('/submit', authenticate, ipRateLimiter, teamRateLimiter, validateFlagSubmission, async (req, res) => {
  // Start a MongoDB session for transaction
  const session = await mongoose.startSession();
  session.startTransaction();
  
  // Generate unique request ID for audit trail (declare at function scope)
  const requestId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  try {
    const teamId = req.user.teamId; // Read from JWT token (secure)
    const { flag, round = 1, challengeType } = req.body;
    const ipAddress = getRealIP(req);
    const userAgent = req.get('user-agent');

    // 🔒 SECURITY: Validate that the user's JWT token is for the correct round
    const userRound = req.user.round; // Round from JWT token
    if (userRound !== round) {
      await session.abortTransaction();
      session.endSession();
      console.log(`[SECURITY:${requestId}] Team ${teamId} attempted to submit Round ${round} flag with Round ${userRound} credentials`);
      return res.status(403).json({ 
        error: `Access denied. You are authenticated for Round ${userRound}, but trying to submit for Round ${round}.`,
        requiredRound: round,
        currentRound: userRound,
        message: `Please authenticate with the Round ${round} API key (MEDUSA_R${round}_2025) to submit flags for this round.`
      });
    }

    // Determine challenge identifier for Round 2
    const challengeId = round === 2 ? `${round}-${challengeType}` : `${round}`;

    // 🔒 SECURITY: Check submission count within transaction (RACE CONDITION PROTECTION)
    // For PWN challenge, count all pwn submissions (user + root) together
    const isPwnChallenge = challengeType === 'pwn-user' || challengeType === 'pwn-root';
    const submissionQuery = round === 2 && isPwnChallenge
      ? { teamId, round, challengeType: { $in: ['pwn-user', 'pwn-root'] } }
      : round === 2
      ? { teamId, round, challengeType }
      : { teamId, round };
    
    const submissionCount = await FlagSubmission.countDocuments(submissionQuery).session(session);

    // Limit: 2 submissions for Round 1 and Android, 3 submissions for PWN (combined user+root)
    const maxSubmissions = (round === 2 && isPwnChallenge) ? 3 : 2;
    
    if (submissionCount >= maxSubmissions) {
      await session.abortTransaction();
      session.endSession();
      return res.status(403).json({ 
        error: `Maximum submission limit reached for this challenge. Your team can only submit ${maxSubmissions} flags per challenge.`,
        submissionCount: submissionCount,
        maxSubmissions: maxSubmissions,
        challenge: challengeType || 'Round 1'
      });
    }

    // Check for duplicate submission for this specific challenge
    const existingSubmission = await FlagSubmission.findOne({ 
      teamId, 
      flag,
      round,
      ...(round === 2 && { challengeType })
    }).session(session);

    if (existingSubmission) {
      await session.abortTransaction();
      session.endSession();
      return res.status(409).json({ 
        error: 'This flag has already been submitted by your team for this challenge',
        submittedAt: existingSubmission.submittedAt,
        challenge: challengeType || 'Round 1'
      });
    }

    // Determine if this is the second submission (point deduction applies)
    const isSecondSubmission = submissionCount === 1;
    const isThirdSubmission = submissionCount === 2;
    
    // Calculate point deduction
    // PWN challenges: No penalty on 2nd attempt, 25% penalty on 3rd attempt
    // Other challenges: 25% penalty on 2nd attempt
    let pointDeduction = 0;
    if (isPwnChallenge) {
      pointDeduction = isThirdSubmission ? 0.25 : 0; // Only penalize 3rd attempt for PWN
    } else {
      pointDeduction = isSecondSubmission ? 0.25 : 0; // Penalize 2nd attempt for others
    }

    // Validate flag based on round and challenge type
    let isCorrect = false;
    let correctFlag = '';

    if (round === 1) {
      correctFlag = CORRECT_FLAG_R1;
      isCorrect = secureCompare(flag.trim(), correctFlag);
    } else if (round === 2) {
      if (challengeType === 'android') {
        correctFlag = CORRECT_FLAGS_R2.android;
      } else if (challengeType === 'pwn-user') {
        correctFlag = CORRECT_FLAGS_R2.pwnUser;
      } else if (challengeType === 'pwn-root') {
        correctFlag = CORRECT_FLAGS_R2.pwnRoot;
      }
      isCorrect = secureCompare(flag.trim(), correctFlag);
    }

    // Security: Never reveal the correct flag in any response
    // Only reveal success/failure
    
    // Use appropriate start time based on round from settings
    const roundStartTime = await getRoundStartTime(round);
    
    // Fetch hint penalty from database (sum all unlocked hints for this team/round/challenge)
    const HintUnlock = (await import('../models/HintUnlock.js')).default;
    // For PWN challenges (both user and root), use 'pwn' as the hint challengeType
    const hintChallengeType = (challengeType === 'pwn-user' || challengeType === 'pwn-root') ? 'pwn' : challengeType;
    const unlockedHints = await HintUnlock.find({
      teamId,
      round,
      challengeType: round === 2 ? hintChallengeType : undefined
    });
    const hintPenalty = unlockedHints.reduce((sum, hint) => sum + hint.pointCost, 0);

    // Determine basePoints according to Round 2 weighting (total 1500)
    // 50% Android, 30% PWN-user, 20% PWN-root
    let basePoints = 1000; // default for legacy behaviour
    if (round === 2) {
      if (challengeType === 'android') basePoints = 1500 * 0.5; // 750
      else if (challengeType === 'pwn-user') basePoints = 1500 * 0.3; // 450
      else if (challengeType === 'pwn-root') basePoints = 1500 * 0.2; // 300
    }

    // Calculate points if correct. calculatePoints now returns an object with breakdown.
    let points = 0;
    let pointsMeta = null;
    if (isCorrect) {
      pointsMeta = calculatePoints(roundStartTime, new Date(), submissionCount + 1, { basePoints, hintPenalty });
      points = pointsMeta.finalPoints;
    }

    const flagSubmission = new FlagSubmission({
      teamId,
      flag: flag.trim(), // Store trimmed flag
      round: round,
      challengeType: round === 2 ? challengeType : undefined,
      ipAddress,
      userAgent,
      isCorrect: isCorrect,
      verified: true, // Auto-verify since we're checking against correct flag
      verifiedAt: new Date(),
      attemptNumber: submissionCount + 1,
      pointDeduction: pointDeduction,
      points: points
    });

    // 🔒 SECURITY: Save within transaction (RACE CONDITION PROTECTION)
    await flagSubmission.save({ session });
    
    // Commit the transaction - this makes it atomic
    await session.commitTransaction();
    session.endSession();

    // Log submission for audit trail (without revealing correct flag)
    console.log(`[AUDIT:${requestId}] Flag submitted by team ${teamId} for ${round === 2 ? `Round 2 (${challengeType})` : 'Round 1'} - Attempt ${submissionCount + 1}/2 - ${isCorrect ? '✅ CORRECT' : '❌ INCORRECT'} - ${points} points - IP: ${ipAddress} - Time: ${new Date().toISOString()}`);

    // Prepare response with submission info
    // SECURITY: Never include the correct flag or hints about it
    const response = {
      success: true,
      correct: isCorrect, // Only boolean, never the actual flag
      message: isCorrect 
        ? '🎉 Congratulations! Your flag is correct!' 
        : '❌ Incorrect flag. Please try again.',
      submissionId: flagSubmission._id,
      submittedAt: flagSubmission.submittedAt,
      attemptNumber: submissionCount + 1,
      remainingAttempts: maxSubmissions - (submissionCount + 1),
      points: points,
      challenge: round === 2 ? `${challengeType}` : 'round1',
      warning: !isCorrect && (submissionCount + 1) >= maxSubmissions
        ? 'This was your final submission! No more attempts remaining.' 
        : !isCorrect && submissionCount === 0
        ? `You have ${maxSubmissions - 1} attempts remaining. Your second submission will have a 25% point deduction.`
        : undefined,
      // Include detailed breakdown for Round 2 (breakdown is null if incorrect)
      breakdown: isCorrect && pointsMeta ? {
        basePoints: pointsMeta.basePoints,
        rawPoints: pointsMeta.rawPoints,
        finalPoints: pointsMeta.finalPoints,
        timeMultiplier: pointsMeta.timeMultiplier,
        attemptPenalty: pointsMeta.attemptPenalty,
        hintPenalty: pointsMeta.hintPenalty
      } : undefined
    };

    res.status(201).json(response);

  } catch (error) {
    // 🔒 SECURITY: Abort transaction on any error (RACE CONDITION PROTECTION)
    await session.abortTransaction();
    session.endSession();
    
    console.error(`[ERROR:${requestId}] Flag submission error:`, error.message);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(409).json({ 
        error: 'This flag has already been submitted' 
      });
    }

    // Generic error response (don't leak internal details)
    res.status(500).json({ 
      error: 'Failed to submit flag. Please try again later.',
      requestId: requestId // Include for support/debugging
    });
  }
});

// Get remaining attempts for current team (for all challenges)
router.get('/remaining-attempts', authenticate, async (req, res) => {
  try {
    const teamId = req.user.teamId; // From JWT token

    // Count submissions for Round 1
    const round1Count = await FlagSubmission.countDocuments({ 
      teamId, 
      round: 1 
    });

    // Count submissions for Round 2 - Android
    const round2AndroidCount = await FlagSubmission.countDocuments({ 
      teamId, 
      round: 2,
      challengeType: 'android' 
    });

    // Count submissions for Round 2 - PWN (both user and root combined)
    const round2PwnCount = await FlagSubmission.countDocuments({ 
      teamId, 
      round: 2,
      challengeType: { $in: ['pwn-user', 'pwn-root'] }
    });

    // Check if challenges are completed (correct submission exists)
    const round1Completed = await FlagSubmission.findOne({ 
      teamId, 
      round: 1,
      isCorrect: true 
    });

    const round2AndroidCompleted = await FlagSubmission.findOne({ 
      teamId, 
      round: 2,
      challengeType: 'android',
      isCorrect: true 
    });

    // Check if either user or root flag is completed for PWN
    const round2PwnUserCompleted = await FlagSubmission.findOne({ 
      teamId, 
      round: 2,
      challengeType: 'pwn-user',
      isCorrect: true 
    });

    const round2PwnRootCompleted = await FlagSubmission.findOne({ 
      teamId, 
      round: 2,
      challengeType: 'pwn-root',
      isCorrect: true 
    });

    const round2PwnCompleted = round2PwnUserCompleted && round2PwnRootCompleted;
    const totalPwnPoints = (round2PwnUserCompleted?.points || 0) + (round2PwnRootCompleted?.points || 0);

    res.json({ 
      success: true,
      teamId,
      attempts: {
        round1: {
          used: round1Count,
          remaining: Math.max(0, 2 - round1Count),
          maxAttempts: 2,
          completed: !!round1Completed,
          completedAt: round1Completed?.submittedAt || null,
          points: round1Completed?.points || 0
        },
        round2: {
          android: {
            used: round2AndroidCount,
            remaining: Math.max(0, 2 - round2AndroidCount),
            maxAttempts: 2,
            completed: !!round2AndroidCompleted,
            completedAt: round2AndroidCompleted?.submittedAt || null,
            points: round2AndroidCompleted?.points || 0
          },
          pwn: {
            used: round2PwnCount,
            remaining: Math.max(0, 3 - round2PwnCount),
            maxAttempts: 3,
            completed: !!round2PwnCompleted,
            completedAt: round2PwnCompleted ? (round2PwnRootCompleted?.submittedAt || round2PwnUserCompleted?.submittedAt) : null,
            points: totalPwnPoints,
            userFlagCompleted: !!round2PwnUserCompleted,
            rootFlagCompleted: !!round2PwnRootCompleted
          }
        }
      }
    });

  } catch (error) {
    console.error('Error fetching remaining attempts:', error);
    res.status(500).json({ 
      error: 'Failed to fetch remaining attempts' 
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

// Get submission statistics - PUBLIC (anonymous aggregate data only)
// Teams and team-specific data are NOT exposed for security
router.get('/stats', async (req, res) => {
  try {
    // Only return anonymous aggregate statistics
    const totalSubmissions = await FlagSubmission.countDocuments();
    const correctSubmissions = await FlagSubmission.countDocuments({ isCorrect: true });
    const incorrectSubmissions = totalSubmissions - correctSubmissions;
    
    // Get statistics by round (anonymous)
    const round1Stats = await FlagSubmission.countDocuments({ round: 1, isCorrect: true });
    const round2AndroidStats = await FlagSubmission.countDocuments({ 
      round: 2, 
      challengeType: 'android', 
      isCorrect: true 
    });
    const round2PwnStats = await FlagSubmission.countDocuments({ 
      round: 2, 
      challengeType: 'pwn', 
      isCorrect: true 
    });

    res.json({
      success: true,
      stats: {
        totalSubmissions,
        correctSubmissions,
        incorrectSubmissions,
        successRate: totalSubmissions > 0 
          ? ((correctSubmissions / totalSubmissions) * 100).toFixed(2) + '%'
          : '0%',
        byRound: {
          round1: { correctSubmissions: round1Stats },
          round2: {
            android: { correctSubmissions: round2AndroidStats },
            pwn: { correctSubmissions: round2PwnStats }
          }
        }
      },
      note: 'Team-specific data is not exposed for security reasons. Use /leaderboard for rankings.'
    });

  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ 
      error: 'Failed to fetch statistics' 
    });
  }
});

export default router;

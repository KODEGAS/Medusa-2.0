import express from 'express';
import FlagSubmission from '../models/FlagSubmission.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Rate limiter: 10 submissions per 5 minutes per IP
const flagSubmissionLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10, // Limit each IP to 10 requests per windowMs
  message: { 
    error: 'Too many flag submissions. Please try again later.',
    retryAfter: '5 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Validation middleware
const validateFlagSubmission = (req, res, next) => {
  const { teamId, flag } = req.body;

  // Validate teamId
  if (!teamId || typeof teamId !== 'string' || teamId.trim().length === 0) {
    return res.status(400).json({ 
      error: 'Team ID is required and must be a valid string' 
    });
  }

  if (teamId.length > 50) {
    return res.status(400).json({ 
      error: 'Team ID is too long (max 50 characters)' 
    });
  }

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

  // Sanitize inputs
  req.body.teamId = teamId.trim();
  req.body.flag = flag.trim();

  next();
};

// Submit flag endpoint
router.post('/submit', flagSubmissionLimiter, validateFlagSubmission, async (req, res) => {
  try {
    const { teamId, flag } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('user-agent');

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

    // TODO: Add actual flag validation logic here
    // For now, we'll just store the submission and mark it for manual verification
    const flagSubmission = new FlagSubmission({
      teamId,
      flag,
      ipAddress,
      userAgent,
      isCorrect: false, // Will be verified later
      verified: false
    });

    await flagSubmission.save();

    res.status(201).json({ 
      success: true,
      message: 'Flag submitted successfully and is being verified',
      submissionId: flagSubmission._id,
      submittedAt: flagSubmission.submittedAt
    });

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

// Get submissions for a team (optional - for admin or team dashboard)
router.get('/submissions/:teamId', async (req, res) => {
  try {
    const { teamId } = req.params;

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

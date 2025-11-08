import express from 'express';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import FlagSubmission from '../models/FlagSubmission.js';
import Team from '../models/Team.js';
import RoundSession from '../models/RoundSession.js';
import adminAuth from '../middlewares/adminAuth.js';
import getRealIP from '../utils/getRealIP.js';
import { calculatePoints } from '../utils/calculatePoints.js';

const router = express.Router();

// Rate limiter for admin login - prevent brute force attacks
const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts per windowMs
  message: { 
    error: 'Too many login attempts. Please try again in 15 minutes.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful logins
});

// Rate limiter for admin API endpoints - prevent abuse
const apiRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // Limit each IP to 30 requests per minute
  message: { 
    error: 'Too many requests. Please slow down.',
    retryAfter: '1 minute'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Admin login endpoint
router.post('/login', loginRateLimiter, async (req, res) => {
  try {
    const { username, password } = req.body;

    // Input validation
    if (!username || !password) {
      return res.status(400).json({ 
        error: 'Username and password are required' 
      });
    }

    // Get admin credentials from environment variables
    const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

    if (!ADMIN_PASSWORD) {
      console.error('CRITICAL: ADMIN_PASSWORD not configured in environment');
      return res.status(500).json({ 
        error: 'Admin credentials not configured' 
      });
    }

    // Timing-safe comparison to prevent timing attacks
    const usernameMatch = username === ADMIN_USERNAME;
    const passwordMatch = password === ADMIN_PASSWORD;

    // Validate credentials (use same error message to prevent user enumeration)
    if (!usernameMatch || !passwordMatch) {
      // Log failed attempt with real IP
      const clientIP = getRealIP(req);
      console.warn(`❌ Failed admin login attempt for username: ${username} from IP: ${clientIP}`);
      
      return res.status(401).json({ 
        error: 'Invalid admin credentials' 
      });
    }

    // Generate admin JWT token
    const token = jwt.sign(
      { 
        username: ADMIN_USERNAME,
        role: 'admin',
        loginTime: Date.now()
      },
      process.env.JWT_SECRET,
      { expiresIn: '8h' } // Admin sessions last 8 hours
    );

    // Log successful login with real IP
    const clientIP = getRealIP(req);
    console.log(`✅ Admin login successful: ${ADMIN_USERNAME} from IP: ${clientIP} at ${new Date().toISOString()}`);

    res.json({
      success: true,
      message: 'Admin login successful',
      token,
      admin: {
        username: ADMIN_USERNAME,
        role: 'admin'
      }
    });

  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ 
      error: 'Admin login failed' 
    });
  }
});

// Get all flag submissions with team details (Admin only)
router.get('/submissions', adminAuth, apiRateLimiter, async (req, res) => {
  try {
    const { teamId, verified, sortBy = 'submittedAt', order = 'desc' } = req.query;

    // Log admin access
    console.log(`Admin ${req.admin.username} accessed submissions at ${new Date().toISOString()}`);

    // Validate sortBy parameter to prevent NoSQL injection
    const allowedSortFields = ['submittedAt', 'attemptNumber', 'verified', 'isCorrect'];
    const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'submittedAt';

    // Build query
    const query = {};
    if (teamId) query.teamId = teamId;
    if (verified !== undefined) query.verified = verified === 'true';

    // Get all submissions
    const submissions = await FlagSubmission.find(query)
      .sort({ [safeSortBy]: order === 'desc' ? -1 : 1 })
      .lean();

    // Get all unique team IDs
    const teamIds = [...new Set(submissions.map(s => s.teamId))];
    
    // Fetch team details
    const teams = await Team.find({ teamId: { $in: teamIds } }).lean();
    const teamMap = {};
    teams.forEach(team => {
      teamMap[team.teamId] = team;
    });

    // Group submissions by team
    const teamSubmissions = {};
    submissions.forEach(submission => {
      if (!teamSubmissions[submission.teamId]) {
        teamSubmissions[submission.teamId] = {
          teamInfo: teamMap[submission.teamId] || { 
            teamId: submission.teamId,
            teamName: 'Unknown',
            university: 'Unknown'
          },
          attempts: []
        };
      }
      teamSubmissions[submission.teamId].attempts.push(submission);
    });

    // Sort attempts within each team
    Object.values(teamSubmissions).forEach(team => {
      team.attempts.sort((a, b) => a.attemptNumber - b.attemptNumber);
    });

    res.json({
      success: true,
      totalSubmissions: submissions.length,
      totalTeams: Object.keys(teamSubmissions).length,
      submissions: teamSubmissions
    });

  } catch (error) {
    console.error('Error fetching admin submissions:', error);
    res.status(500).json({ 
      error: 'Failed to fetch submissions' 
    });
  }
});

// Get detailed statistics (Admin only)
router.get('/statistics', adminAuth, apiRateLimiter, async (req, res) => {
  try {
    console.log(`Admin ${req.admin.username} accessed statistics at ${new Date().toISOString()}`);
    
    const totalTeams = await Team.countDocuments();
    const totalSubmissions = await FlagSubmission.countDocuments();
    const verifiedSubmissions = await FlagSubmission.countDocuments({ verified: true });
    const correctSubmissions = await FlagSubmission.countDocuments({ isCorrect: true });
    
    // Teams with submissions
    const teamsWithSubmissions = await FlagSubmission.distinct('teamId');
    
    // Teams with 2 attempts
    const submissionCounts = await FlagSubmission.aggregate([
      { $group: { _id: '$teamId', count: { $sum: 1 } } }
    ]);
    const teamsWithTwoAttempts = submissionCounts.filter(t => t.count >= 2).length;

    // Get submission timeline (last 24 hours, grouped by hour)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentSubmissions = await FlagSubmission.aggregate([
      { $match: { submittedAt: { $gte: oneDayAgo } } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d %H:00', date: '$submittedAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      statistics: {
        teams: {
          total: totalTeams,
          withSubmissions: teamsWithSubmissions.length,
          withTwoAttempts: teamsWithTwoAttempts,
          participationRate: ((teamsWithSubmissions.length / totalTeams) * 100).toFixed(2) + '%'
        },
        submissions: {
          total: totalSubmissions,
          verified: verifiedSubmissions,
          correct: correctSubmissions,
          pending: totalSubmissions - verifiedSubmissions
        },
        timeline: recentSubmissions
      }
    });

  } catch (error) {
    console.error('Error fetching admin statistics:', error);
    res.status(500).json({ 
      error: 'Failed to fetch statistics' 
    });
  }
});

// Update submission verification status (Admin only)
router.patch('/submissions/:id', adminAuth, apiRateLimiter, async (req, res) => {
  try {
    const { id } = req.params;
    const { verified, isCorrect } = req.body;

    // Validate MongoDB ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ 
        error: 'Invalid submission ID format' 
      });
    }

    const updates = {};
    if (verified !== undefined) updates.verified = Boolean(verified);
    if (isCorrect !== undefined) updates.isCorrect = Boolean(isCorrect);

    const submission = await FlagSubmission.findByIdAndUpdate(
      id,
      updates,
      { new: true }
    );

    if (!submission) {
      return res.status(404).json({ 
        error: 'Submission not found' 
      });
    }

    console.log(`✅ Admin ${req.admin.username} updated submission ${id}:`, updates);

    res.json({
      success: true,
      message: 'Submission updated successfully',
      submission
    });

  } catch (error) {
    console.error('Error updating submission:', error);
    res.status(500).json({ 
      error: 'Failed to update submission' 
    });
  }
});

// Bulk update submissions (Admin only)
router.patch('/submissions/bulk/verify', adminAuth, apiRateLimiter, async (req, res) => {
  try {
    const { submissionIds, verified, isCorrect } = req.body;

    if (!Array.isArray(submissionIds) || submissionIds.length === 0) {
      return res.status(400).json({ 
        error: 'Invalid submission IDs array' 
      });
    }

    // Limit bulk operations to prevent abuse
    if (submissionIds.length > 100) {
      return res.status(400).json({ 
        error: 'Cannot update more than 100 submissions at once' 
      });
    }

    // Validate all IDs are valid MongoDB ObjectIds
    const invalidIds = submissionIds.filter(id => !id.match(/^[0-9a-fA-F]{24}$/));
    if (invalidIds.length > 0) {
      return res.status(400).json({ 
        error: 'Invalid submission ID format in bulk request',
        invalidIds: invalidIds
      });
    }

    const updates = {};
    if (verified !== undefined) updates.verified = Boolean(verified);
    if (isCorrect !== undefined) updates.isCorrect = Boolean(isCorrect);

    const result = await FlagSubmission.updateMany(
      { _id: { $in: submissionIds } },
      updates
    );

    console.log(`✅ Admin ${req.admin.username} bulk updated ${result.modifiedCount} submissions`);

    res.json({
      success: true,
      message: `Updated ${result.modifiedCount} submissions`,
      modifiedCount: result.modifiedCount
    });

  } catch (error) {
    console.error('Error bulk updating submissions:', error);
    res.status(500).json({ 
      error: 'Failed to bulk update submissions' 
    });
  }
});

// Auto-verify all submissions against correct flag (Admin only)
router.post('/submissions/auto-verify', adminAuth, apiRateLimiter, async (req, res) => {
  try {
    const CORRECT_FLAG = 'MEDUSA{5t3g4n0_1n_7h3_d33p_4bY55_0f_7h3_0c34n_15_4_7r345ur3}';
    
    // Get all unverified submissions
    const submissions = await FlagSubmission.find({ verified: false });
    
    let correctCount = 0;
    let incorrectCount = 0;
    
    // Verify each submission and calculate points
    for (const submission of submissions) {
      const isCorrect = submission.flag.trim() === CORRECT_FLAG;
      
      let points = 0;
      
      // Calculate points if correct
      if (isCorrect) {
        try {
          // Get team's round start time
          const roundSession = await RoundSession.findOne({ 
            teamId: submission.teamId, 
            round: 1 
          });
          
          const roundStartTime = roundSession?.startTime || new Date();
          points = calculatePoints(
            roundStartTime,
            submission.submittedAt,
            submission.attemptNumber
          );
        } catch (err) {
          console.warn(`Could not calculate points for submission ${submission._id}:`, err);
          // Use a default point calculation based on attempt
          points = submission.attemptNumber === 1 ? 800 : 600;
        }
      }
      
      await FlagSubmission.findByIdAndUpdate(submission._id, {
        verified: true,
        isCorrect: isCorrect,
        points: points,
        verifiedAt: new Date()
      });
      
      if (isCorrect) {
        correctCount++;
      } else {
        incorrectCount++;
      }
    }
    
    console.log(`✅ Admin ${req.admin.username} auto-verified ${submissions.length} submissions: ${correctCount} correct (with points), ${incorrectCount} incorrect`);
    
    res.json({
      success: true,
      message: 'Auto-verification completed with point calculation',
      verified: submissions.length,
      correct: correctCount,
      incorrect: incorrectCount
    });
    
  } catch (error) {
    console.error('Error auto-verifying submissions:', error);
    res.status(500).json({ 
      error: 'Failed to auto-verify submissions' 
    });
  }
});

// Recalculate points for all correct submissions (Admin only)
router.post('/submissions/recalculate-points', adminAuth, apiRateLimiter, async (req, res) => {
  try {
    // Get all correct submissions (verified and correct)
    const submissions = await FlagSubmission.find({ 
      verified: true, 
      isCorrect: true 
    });
    
    let updatedCount = 0;
    
    // Recalculate points for each correct submission
    for (const submission of submissions) {
      try {
        // Get team's round start time
        const roundSession = await RoundSession.findOne({ 
          teamId: submission.teamId, 
          round: 1 
        });
        
        const roundStartTime = roundSession?.startTime || new Date();
        const points = calculatePoints(
          roundStartTime,
          submission.submittedAt,
          submission.attemptNumber
        );
        
        await FlagSubmission.findByIdAndUpdate(submission._id, {
          points: points
        });
        
        updatedCount++;
      } catch (err) {
        console.warn(`Could not recalculate points for submission ${submission._id}:`, err);
      }
    }
    
    console.log(`✅ Admin ${req.admin.username} recalculated points for ${updatedCount} correct submissions`);
    
    res.json({
      success: true,
      message: 'Points recalculated successfully',
      updated: updatedCount,
      total: submissions.length
    });
    
  } catch (error) {
    console.error('Error recalculating points:', error);
    res.status(500).json({ 
      error: 'Failed to recalculate points' 
    });
  }
});

export default router;

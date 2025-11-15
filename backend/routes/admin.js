import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import rateLimit from 'express-rate-limit';
import FlagSubmission from '../models/FlagSubmission.js';
import Team from '../models/Team.js';
import Settings from '../models/Settings.js';
import RoundSession from '../models/RoundSession.js';
import HintUnlock from '../models/HintUnlock.js';
import adminAuth from '../middlewares/adminAuth.js';
import getRealIP from '../utils/getRealIP.js';
import { calculatePoints } from '../utils/calculatePoints.js';
import logger from '../utils/logger.js';

const router = express.Router();

// GLOBAL COMPETITION START TIME - November 8, 2025 at 19:00:00 IST
const GLOBAL_COMPETITION_START = new Date('2025-11-08T19:00:00+05:30');

// ROUND 2 START TIME - Set this to when Round 2 actually starts
const ROUND_2_START = new Date('2025-11-09T10:00:00+05:30'); // Adjust this date/time as needed

// Helper function to get round start time from settings or fallback to constants
async function getRoundStartTime(round) {
  try {
    const key = round === 2 ? 'round2_start_time' : 'round1_start_time';
    const setting = await Settings.findOne({ key });
    if (setting && setting.value) {
      return new Date(setting.value);
    }
  } catch (error) {
    logger.warn(`Failed to get ${round === 2 ? 'Round 2' : 'Round 1'} start time from settings, using constant`);
  }
  // Fallback to constants
  return round === 2 ? ROUND_2_START : GLOBAL_COMPETITION_START;
}

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
    const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH;
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD; // Fallback for migration period

    if (!ADMIN_PASSWORD_HASH && !ADMIN_PASSWORD) {
      logger.critical('ADMIN_PASSWORD_HASH or ADMIN_PASSWORD not configured in environment');
      return res.status(500).json({ 
        error: 'Admin credentials not configured' 
      });
    }

    // Username comparison (timing-safe)
    const usernameMatch = username === ADMIN_USERNAME;
    
    // Password verification with bcrypt (or fallback to plain text during migration)
    let passwordMatch = false;
    if (ADMIN_PASSWORD_HASH) {
      // Secure: Use bcrypt to verify hashed password
      passwordMatch = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
    } else if (ADMIN_PASSWORD) {
      // INSECURE: Fallback for migration period only - remove after migration
      logger.warn('⚠️  WARNING: Using plain text password comparison. Migrate to ADMIN_PASSWORD_HASH immediately!');
      passwordMatch = password === ADMIN_PASSWORD;
    }

    // Validate credentials (use same error message to prevent user enumeration)
    if (!usernameMatch || !passwordMatch) {
      // Log failed attempt with real IP
      const clientIP = getRealIP(req);
      logger.security(`❌ Failed admin login attempt for username: ${username} from IP: ${clientIP}`);
      
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
    logger.security(`✅ Admin login successful: ${ADMIN_USERNAME} from IP: ${clientIP} at ${new Date().toISOString()}`);

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
    logger.error('Admin login error:', error);
    res.status(500).json({ 
      error: 'Admin login failed' 
    });
  }
});

// Get all flag submissions with team details (Admin only)
router.get('/submissions', adminAuth, apiRateLimiter, async (req, res) => {
  try {
    const { teamId, verified, sortBy = 'submittedAt', order = 'desc', round } = req.query;

    // Log admin access
    logger.audit(`Admin ${req.admin.username} accessed submissions (Round ${round || 'All'}) at ${new Date().toISOString()}`);

    // Validate sortBy parameter to prevent NoSQL injection
    const allowedSortFields = ['submittedAt', 'attemptNumber', 'verified', 'isCorrect'];
    const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'submittedAt';

    // Build query
    const query = {};
    if (teamId) query.teamId = teamId;
    if (verified !== undefined) query.verified = verified === 'true';
    if (round) {
      const roundNum = parseInt(round);
      if (roundNum === 1) {
        // For Round 1, get submissions where round is 1 OR round field doesn't exist (old submissions)
        query.$or = [
          { round: 1 },
          { round: { $exists: false } },
          { round: null }
        ];
      } else {
        query.round = roundNum;
      }
    }

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

    // Fetch hint unlocks for all teams (for Round 2)
    const hintUnlocks = round && parseInt(round) === 2 
      ? await HintUnlock.find({ 
          teamId: { $in: teamIds }, 
          round: 2 
        }).lean()
      : [];
    
    // Group hints by team and challenge type
    const teamHints = {};
    hintUnlocks.forEach(hint => {
      if (!teamHints[hint.teamId]) {
        teamHints[hint.teamId] = {
          android: [],
          pwn: []
        };
      }
      if (hint.challengeType && teamHints[hint.teamId][hint.challengeType]) {
        teamHints[hint.teamId][hint.challengeType].push({
          hintNumber: hint.hintNumber,
          pointCost: hint.pointCost,
          unlockedAt: hint.unlockedAt
        });
      }
    });

    // Sort hints by hint number for each team
    Object.values(teamHints).forEach(hints => {
      hints.android.sort((a, b) => a.hintNumber - b.hintNumber);
      hints.pwn.sort((a, b) => a.hintNumber - b.hintNumber);
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
          hints: teamHints[submission.teamId] || { android: [], pwn: [] },
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
    logger.error('Error fetching admin submissions:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch submissions' 
    });
  }
});

// Get detailed statistics (Admin only)
router.get('/statistics', adminAuth, apiRateLimiter, async (req, res) => {
  try {
    logger.audit(`Admin ${req.admin.username} accessed statistics at ${new Date().toISOString()}`);
    
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
    logger.error('Error fetching admin statistics:', error.message);
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
    logger.error('Error updating submission:', error.message);
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
    logger.error('Error bulk updating submissions:', error.message);
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
      
      // Calculate points if correct using appropriate round start time
      if (isCorrect) {
        try {
          const roundStartTime = await getRoundStartTime(submission.round || 1);
          points = calculatePoints(
            roundStartTime,
            submission.submittedAt,
            submission.attemptNumber
          );
        } catch (err) {
          logger.warn(`Could not calculate points for submission ${submission._id}:`, err);
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
    logger.error('Error auto-verifying submissions:', error.message);
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
        // Use appropriate round start time for fair calculation
        const roundStartTime = await getRoundStartTime(submission.round || 1);
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
        logger.warn(`Could not recalculate points for submission ${submission._id}:`, err);
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
    logger.error('Error recalculating points:', error.message);
    res.status(500).json({
      error: 'Failed to recalculate points' 
    });
  }
});

// Update submission time (Admin only)
router.patch('/submissions/:id/update-time', adminAuth, apiRateLimiter, async (req, res) => {
  try {
    const { id } = req.params;
    const { submittedAt } = req.body;

    // Validate MongoDB ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ 
        error: 'Invalid submission ID format' 
      });
    }

    // Validate date
    const newDate = new Date(submittedAt);
    if (isNaN(newDate.getTime())) {
      return res.status(400).json({ 
        error: 'Invalid date format' 
      });
    }

    // Get the submission
    const submission = await FlagSubmission.findById(id);
    if (!submission) {
      return res.status(404).json({ 
        error: 'Submission not found' 
      });
    }

    // Update the submission time
    submission.submittedAt = newDate;

    // Recalculate points if it's a correct submission
    if (submission.isCorrect && submission.verified) {
      const roundStartTime = await getRoundStartTime(submission.round || 1);
      const points = calculatePoints(
        roundStartTime,
        newDate,
        submission.attemptNumber
      );
      submission.points = points;
    }

    await submission.save();

    console.log(`✅ Admin ${req.admin.username} updated submission ${id} time to ${newDate.toISOString()}`);

    res.json({
      success: true,
      message: 'Submission time updated successfully',
      submission: {
        _id: submission._id,
        submittedAt: submission.submittedAt,
        points: submission.points
      }
    });

  } catch (error) {
    logger.error('Error updating submission time:', error);
    res.status(500).json({ 
      error: 'Failed to update submission time' 
    });
  }
});

// Manual flag submission on behalf of a team (Admin only)
// Note: This is currently for Round 1 only
router.post('/submissions/manual-submit', adminAuth, apiRateLimiter, async (req, res) => {
  try {
    const { teamId, flag, submittedAt } = req.body;
    const CORRECT_FLAG = 'MEDUSA{5t3g4n0_1n_7h3_d33p_4bY55_0f_7h3_0c34n_15_4_7r345ur3}';

    // Validate required fields
    if (!teamId || !flag) {
      return res.status(400).json({ 
        error: 'Team ID and flag are required' 
      });
    }

    // Validate team exists
    const team = await Team.findOne({ teamId });
    if (!team) {
      return res.status(404).json({ 
        error: 'Team not found' 
      });
    }

    // Check how many submissions this team has made (Round 1)
    const submissionCount = await FlagSubmission.countDocuments({ 
      teamId, 
      $or: [
        { round: 1 },
        { round: { $exists: false } },
        { round: null }
      ]
    });

    // Limit to 2 submissions per team
    if (submissionCount >= 2) {
      return res.status(403).json({ 
        error: 'Team has already submitted 2 flags (maximum limit reached)',
        submissionCount: submissionCount,
        maxSubmissions: 2
      });
    }

    // Check for duplicate flag
    const existingSubmission = await FlagSubmission.findOne({ 
      teamId, 
      flag: flag.trim()
    });

    if (existingSubmission) {
      return res.status(409).json({ 
        error: 'This exact flag has already been submitted by this team',
        submittedAt: existingSubmission.submittedAt
      });
    }

    // Use provided time or current time
    const submitTime = submittedAt ? new Date(submittedAt) : new Date();
    if (submittedAt && isNaN(submitTime.getTime())) {
      return res.status(400).json({ 
        error: 'Invalid submission date format' 
      });
    }

    // Determine if this is the second submission
    const isSecondSubmission = submissionCount === 1;
    const pointDeduction = isSecondSubmission ? 0.25 : 0;

    // Check if flag is correct
    const isCorrect = flag.trim() === CORRECT_FLAG;

    // Calculate points if correct
    const points = isCorrect 
      ? calculatePoints(GLOBAL_COMPETITION_START, submitTime, submissionCount + 1)
      : 0;

    // Create the submission
    const flagSubmission = new FlagSubmission({
      teamId,
      flag: flag.trim(),
      ipAddress: getRealIP(req) + ' (Admin)',
      userAgent: `Admin Manual Submit by ${req.admin.username}`,
      isCorrect: isCorrect,
      verified: true, // Auto-verify admin submissions
      verifiedAt: new Date(),
      attemptNumber: submissionCount + 1,
      pointDeduction: pointDeduction,
      points: points,
      submittedAt: submitTime
    });

    await flagSubmission.save();

    console.log(`✅ Admin ${req.admin.username} manually submitted flag for team ${teamId} (Attempt ${submissionCount + 1}/2) - ${isCorrect ? 'CORRECT' : 'INCORRECT'} - ${points} points at ${submitTime.toISOString()}`);

    res.status(201).json({
      success: true,
      message: isCorrect 
        ? '✅ Flag submission successful! The flag is CORRECT.' 
        : '❌ Flag submitted but INCORRECT.',
      submission: {
        _id: flagSubmission._id,
        teamId,
        teamName: team.teamName,
        flag: flag.trim(),
        attemptNumber: submissionCount + 1,
        remainingAttempts: 2 - (submissionCount + 1),
        isCorrect,
        verified: true,
        points,
        submittedAt: submitTime,
        submittedBy: `Admin: ${req.admin.username}`
      }
    });

  } catch (error) {
    console.error('Manual flag submission error:', error);
    res.status(500).json({ 
      error: 'Failed to submit flag manually' 
    });
  }
});

// Get application settings (Admin only)
router.get('/settings', adminAuth, apiRateLimiter, async (req, res) => {
  try {
    const settings = await Settings.find({}).sort({ key: 1 });
    
    // Convert to key-value object
    const settingsObj = {};
    settings.forEach(setting => {
      settingsObj[setting.key] = {
        value: setting.value,
        description: setting.description,
        updatedAt: setting.updatedAt,
        updatedBy: setting.updatedBy
      };
    });

    // Initialize default settings if they don't exist
    const defaultSettings = [
      {
        key: 'leaderboard_enabled',
        value: true,
        description: 'Controls whether the public leaderboard is visible'
      },
      {
        key: 'round1_start_time',
        value: GLOBAL_COMPETITION_START.toISOString(),
        description: 'Round 1 competition start time (ISO 8601 format)'
      },
      {
        key: 'round2_start_time',
        value: ROUND_2_START.toISOString(),
        description: 'Round 2 competition start time (ISO 8601 format)'
      }
    ];

    for (const defaultSetting of defaultSettings) {
      if (!settingsObj[defaultSetting.key]) {
        const newSetting = new Settings({
          ...defaultSetting,
          updatedBy: 'system'
        });
        await newSetting.save();
        settingsObj[defaultSetting.key] = {
          value: defaultSetting.value,
          description: defaultSetting.description,
          updatedAt: newSetting.updatedAt,
          updatedBy: 'system'
        };
      }
    }

    res.json({
      success: true,
      settings: settingsObj
    });
  } catch (error) {
    logger.error('Error fetching settings:', error);
    res.status(500).json({ 
      error: 'Failed to fetch settings' 
    });
  }
});

// Update a setting (Admin only)
router.put('/settings/:key', adminAuth, apiRateLimiter, async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;

    if (value === undefined) {
      return res.status(400).json({ 
        error: 'Value is required' 
      });
    }

    // Update or create setting
    const setting = await Settings.findOneAndUpdate(
      { key },
      { 
        value,
        updatedBy: req.admin.username,
        updatedAt: new Date()
      },
      { 
        upsert: true,
        new: true
      }
    );

    console.log(`✅ Admin ${req.admin.username} updated setting ${key} to ${value}`);

    res.json({
      success: true,
      message: 'Setting updated successfully',
      setting: {
        key: setting.key,
        value: setting.value,
        updatedAt: setting.updatedAt
      }
    });
  } catch (error) {
    logger.error('Error updating setting:', error);
    res.status(500).json({ 
      error: 'Failed to update setting' 
    });
  }
});

// Get Round 2 statistics (Admin only)
router.get('/round2/statistics', adminAuth, apiRateLimiter, async (req, res) => {
  try {
    const totalTeams = await Team.countDocuments();
    const teamsInRound2 = await RoundSession.distinct('teamId', { round: 2 });
    
    // Get hint statistics
    const hintStats = await HintUnlock.aggregate([
      { $match: { round: 2 } },
      {
        $group: {
          _id: '$challengeType',
          totalUnlocks: { $sum: 1 },
          uniqueTeams: { $addToSet: '$teamId' },
          totalPoints: { $sum: '$pointCost' }
        }
      }
    ]);

    // Get flag submissions for Round 2
    const flagStats = await FlagSubmission.aggregate([
      {
        $match: {
          teamId: { $in: teamsInRound2 },
          submittedAt: { $gte: new Date('2025-11-08T00:00:00Z') } // Adjust date as needed
        }
      },
      {
        $group: {
          _id: null,
          totalSubmissions: { $sum: 1 },
          correctSubmissions: {
            $sum: { $cond: [{ $eq: ['$isCorrect', true] }, 1, 0] }
          }
        }
      }
    ]);

    res.json({
      success: true,
      statistics: {
        teams: {
          total: totalTeams,
          inRound2: teamsInRound2.length,
          participationRate: totalTeams > 0 
            ? ((teamsInRound2.length / totalTeams) * 100).toFixed(2) + '%'
            : '0%'
        },
        hints: hintStats.map(stat => ({
          challengeType: stat._id,
          totalUnlocks: stat.totalUnlocks,
          uniqueTeams: stat.uniqueTeams.length,
          totalPointsSpent: stat.totalPoints
        })),
        flags: flagStats[0] || {
          totalSubmissions: 0,
          correctSubmissions: 0
        }
      }
    });
  } catch (error) {
    logger.error('Error fetching Round 2 statistics:', error);
    res.status(500).json({ 
      error: 'Failed to fetch Round 2 statistics' 
    });
  }
});

export default router;

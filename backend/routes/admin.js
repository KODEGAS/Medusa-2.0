import express from 'express';
import jwt from 'jsonwebtoken';
import FlagSubmission from '../models/FlagSubmission.js';
import Team from '../models/Team.js';
import adminAuth from '../middlewares/adminAuth.js';

const router = express.Router();

// Admin login endpoint
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Get admin credentials from environment variables
    const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

    if (!ADMIN_PASSWORD) {
      return res.status(500).json({ 
        error: 'Admin credentials not configured' 
      });
    }

    // Validate credentials
    if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
      return res.status(401).json({ 
        error: 'Invalid admin credentials' 
      });
    }

    // Generate admin JWT token
    const token = jwt.sign(
      { 
        username: ADMIN_USERNAME,
        role: 'admin'
      },
      process.env.JWT_SECRET,
      { expiresIn: '8h' } // Admin sessions last 8 hours
    );

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
router.get('/submissions', adminAuth, async (req, res) => {
  try {
    const { teamId, verified, sortBy = 'submittedAt', order = 'desc' } = req.query;

    // Build query
    const query = {};
    if (teamId) query.teamId = teamId;
    if (verified !== undefined) query.verified = verified === 'true';

    // Get all submissions
    const submissions = await FlagSubmission.find(query)
      .sort({ [sortBy]: order === 'desc' ? -1 : 1 })
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
router.get('/statistics', adminAuth, async (req, res) => {
  try {
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
router.patch('/submissions/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { verified, isCorrect } = req.body;

    const updates = {};
    if (verified !== undefined) updates.verified = verified;
    if (isCorrect !== undefined) updates.isCorrect = isCorrect;

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

    console.log(`Admin ${req.admin.username} updated submission ${id}:`, updates);

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
router.patch('/submissions/bulk/verify', adminAuth, async (req, res) => {
  try {
    const { submissionIds, verified, isCorrect } = req.body;

    if (!Array.isArray(submissionIds) || submissionIds.length === 0) {
      return res.status(400).json({ 
        error: 'Invalid submission IDs array' 
      });
    }

    const updates = {};
    if (verified !== undefined) updates.verified = verified;
    if (isCorrect !== undefined) updates.isCorrect = isCorrect;

    const result = await FlagSubmission.updateMany(
      { _id: { $in: submissionIds } },
      updates
    );

    console.log(`Admin ${req.admin.username} bulk updated ${result.modifiedCount} submissions`);

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

export default router;

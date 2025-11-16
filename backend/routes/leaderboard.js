import express from 'express';
import FlagSubmission from '../models/FlagSubmission.js';
import Team from '../models/Team.js';
import Settings from '../models/Settings.js';

const router = express.Router();

// Public leaderboard endpoint - shows teams with correct submissions only
router.get('/', async (req, res) => {
  try {
    // Check if leaderboard is enabled
    const leaderboardSetting = await Settings.findOne({ key: 'leaderboard_enabled' });
    const isLeaderboardEnabled = leaderboardSetting ? leaderboardSetting.value : true; // Default to enabled

    if (!isLeaderboardEnabled) {
      return res.status(403).json({
        success: false,
        error: 'Leaderboard is temporarily unavailable',
        message: 'The leaderboard will be available after Round 2 ends',
        enabled: false
      });
    }
    // Get all correct submissions with total points per team
    const leaderboardData = await FlagSubmission.aggregate([
      // Only correct submissions
      { $match: { isCorrect: true, verified: true } },
      
      // Group by team and sum all their points
      { 
        $group: { 
          _id: '$teamId',
          totalPoints: { $sum: '$points' },
          submissionCount: { $sum: 1 },
          lastSubmittedAt: { $max: '$submittedAt' },
          firstSubmittedAt: { $min: '$submittedAt' }
        } 
      },
      
      // Sort by total points (descending), then by first submission time (ascending - earlier is better)
      { $sort: { totalPoints: -1, firstSubmittedAt: 1 } }
    ]);

    // Enrich with team information
    const enrichedLeaderboard = await Promise.all(
      leaderboardData.map(async (entry, index) => {
        const team = await Team.findOne({ teamId: entry._id }).select('teamName university leaderName');
        
        return {
          rank: index + 1,
          // teamId: entry._id, // REMOVED for security - don't expose team IDs publicly
          teamName: team?.teamName || 'Unknown Team',
          university: team?.university || 'Unknown University',
          leaderName: team?.leaderName || null,
          points: Math.round(entry.totalPoints * 10) / 10, // Round to 1 decimal place to fix floating point precision
          submissionCount: entry.submissionCount,
          firstSolvedAt: entry.firstSubmittedAt,
          lastSolvedAt: entry.lastSubmittedAt
        };
      })
    );

    // Get total statistics
    const totalTeams = await Team.countDocuments({ isActive: true });
    const solvedTeams = enrichedLeaderboard.length;
    const totalSubmissions = await FlagSubmission.countDocuments();

    res.json({
      success: true,
      leaderboard: enrichedLeaderboard,
      statistics: {
        totalTeams,
        solvedTeams,
        totalSubmissions,
        solveRate: totalTeams > 0 ? ((solvedTeams / totalTeams) * 100).toFixed(1) + '%' : '0%'
      },
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch leaderboard data' 
    });
  }
});

// Get specific team's position
router.get('/team/:teamId', async (req, res) => {
  try {
    const { teamId } = req.params;

    // Get team's total points from all correct submissions
    const teamSubmissions = await FlagSubmission.aggregate([
      { $match: { teamId, isCorrect: true, verified: true } },
      { 
        $group: { 
          _id: '$teamId',
          totalPoints: { $sum: '$points' },
          submissionCount: { $sum: 1 },
          firstSubmittedAt: { $min: '$submittedAt' },
          lastSubmittedAt: { $max: '$submittedAt' }
        } 
      }
    ]);

    if (!teamSubmissions.length) {
      return res.json({
        success: true,
        hasSolved: false,
        message: 'Team has not solved any challenge yet'
      });
    }

    const teamData = teamSubmissions[0];

    // Count teams with better total scores
    const betterTeams = await FlagSubmission.aggregate([
      { $match: { isCorrect: true, verified: true } },
      { $group: { _id: '$teamId', totalPoints: { $sum: '$points' } } },
      { $match: { totalPoints: { $gt: teamData.totalPoints } } },
      { $count: 'count' }
    ]);

    const rank = (betterTeams[0]?.count || 0) + 1;

    // Get team info
    const team = await Team.findOne({ teamId }).select('teamName university');

    res.json({
      success: true,
      hasSolved: true,
      rank,
      // teamId removed for security
      teamName: team?.teamName,
      university: team?.university,
      points: Math.round(teamData.totalPoints * 10) / 10, // Round to 1 decimal place to fix floating point precision
      submissionCount: teamData.submissionCount,
      firstSolvedAt: teamData.firstSubmittedAt,
      lastSolvedAt: teamData.lastSubmittedAt
    });

  } catch (error) {
    console.error('Team position error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch team position' 
    });
  }
});

export default router;

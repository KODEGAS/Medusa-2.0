import express from 'express';
import FlagSubmission from '../models/FlagSubmission.js';
import Team from '../models/Team.js';

const router = express.Router();

// Public leaderboard endpoint - shows teams with correct submissions only
router.get('/', async (req, res) => {
  try {
    // Get all correct submissions with highest points per team
    const leaderboardData = await FlagSubmission.aggregate([
      // Only correct submissions
      { $match: { isCorrect: true, verified: true } },
      
      // Sort first to ensure we get the best submission per team
      { $sort: { points: -1, submittedAt: 1 } },
      
      // Group by team and get the submission with highest points (first after sort)
      { 
        $group: { 
          _id: '$teamId',
          maxPoints: { $first: '$points' },
          attemptNumber: { $first: '$attemptNumber' },
          submittedAt: { $first: '$submittedAt' },
          pointDeduction: { $first: '$pointDeduction' }
        } 
      },
      
      // Sort by points (descending), then by time (ascending - earlier is better)
      { $sort: { maxPoints: -1, submittedAt: 1 } }
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
          points: entry.maxPoints,
          attemptNumber: entry.attemptNumber,
          solvedAt: entry.submittedAt,
          pointDeduction: entry.pointDeduction
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

    // Get team's best submission
    const teamSubmission = await FlagSubmission.findOne({ 
      teamId, 
      isCorrect: true, 
      verified: true 
    })
    .sort({ points: -1 })
    .limit(1);

    if (!teamSubmission) {
      return res.json({
        success: true,
        hasSolved: false,
        message: 'Team has not solved the challenge yet'
      });
    }

    // Count teams with better scores
    const betterTeams = await FlagSubmission.aggregate([
      { $match: { isCorrect: true, verified: true } },
      { $group: { _id: '$teamId', maxPoints: { $max: '$points' } } },
      { $match: { maxPoints: { $gt: teamSubmission.points } } },
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
      points: teamSubmission.points,
      attemptNumber: teamSubmission.attemptNumber,
      solvedAt: teamSubmission.submittedAt
    });

  } catch (error) {
    console.error('Team position error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch team position' 
    });
  }
});

export default router;

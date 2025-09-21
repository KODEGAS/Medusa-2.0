import express from 'express';
import Team from '../models/Team.js';

const router = express.Router();

// Create new team with members
router.post('/', async (req, res) => {
  try {
    // Validate required leader fields
    const { teamName, university, leaderName, leaderEmail, leaderPhone, members } = req.body;
    
    if (!leaderName || !leaderEmail || !leaderPhone) {
      return res.status(400).json({ 
        error: 'Leader details are required', 
        missing: {
          leaderName: !leaderName,
          leaderEmail: !leaderEmail,
          leaderPhone: !leaderPhone
        }
      });
    }

    // Validate that leader is the first member
    if (!members || members.length === 0) {
      return res.status(400).json({ error: 'At least one member (leader) is required' });
    }

    const firstMember = members[0];
    if (firstMember.name !== leaderName || firstMember.email !== leaderEmail || firstMember.phone !== leaderPhone) {
      return res.status(400).json({ error: 'Leader must be the first member in the members array' });
    }
    
    const team = new Team(req.body);
    const savedTeam = await team.save();
    
    res.status(201).json(savedTeam);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all teams with members
router.get('/', async (req, res) => {
  try {
    const teams = await Team.find();
    res.json(teams);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

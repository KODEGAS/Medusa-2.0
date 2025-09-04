import express from 'express';
import Team from '../models/Team.js';

const router = express.Router();

// Create new team with members
router.post('/', async (req, res) => {
  try {
    const team = new Team(req.body); // req.body should include teamName, university, members[]
    await team.save();
    res.status(201).json(team);
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

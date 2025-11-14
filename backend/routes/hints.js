import express from 'express';
import HintUnlock from '../models/HintUnlock.js';
import authenticate from '../middlewares/authenticate.js';

const router = express.Router();

// Hint costs per hint number
const HINT_COSTS = {
  1: 50,
  2: 100,
  3: 150
};

// Get unlocked hints for current team
router.get('/unlocked', authenticate, async (req, res) => {
  try {
    const teamId = req.user.teamId;
    const { round, challengeType } = req.query;

    const query = { teamId };
    if (round) query.round = parseInt(round);
    if (challengeType) query.challengeType = challengeType;

    const unlockedHints = await HintUnlock.find(query).sort({ unlockedAt: 1 });

    res.json({
      success: true,
      hints: unlockedHints
    });
  } catch (error) {
    console.error('Error fetching unlocked hints:', error);
    res.status(500).json({
      error: 'Failed to fetch unlocked hints'
    });
  }
});

// Unlock a hint
router.post('/unlock', authenticate, async (req, res) => {
  try {
    const teamId = req.user.teamId;
    const { round, challengeType, hintNumber } = req.body;

    // Validate input
    if (!round || ![1, 2].includes(round)) {
      return res.status(400).json({ error: 'Invalid round number. Must be 1 or 2' });
    }

    if (round === 2 && !['android', 'pwn-user', 'pwn-root'].includes(challengeType)) {
      return res.status(400).json({ error: 'Invalid challengeType for Round 2' });
    }

    if (!hintNumber || ![1, 2, 3].includes(hintNumber)) {
      return res.status(400).json({ error: 'Invalid hint number. Must be 1, 2, or 3' });
    }

    // Check if hint already unlocked
    const existing = await HintUnlock.findOne({
      teamId,
      round,
      challengeType: round === 2 ? challengeType : null,
      hintNumber
    });

    if (existing) {
      return res.status(409).json({
        error: 'This hint has already been unlocked',
        unlockedAt: existing.unlockedAt
      });
    }

    // Check if previous hints are unlocked (must unlock in order)
    if (hintNumber > 1) {
      const previousHint = await HintUnlock.findOne({
        teamId,
        round,
        challengeType: round === 2 ? challengeType : null,
        hintNumber: hintNumber - 1
      });

      if (!previousHint) {
        return res.status(400).json({
          error: `You must unlock hint ${hintNumber - 1} before unlocking hint ${hintNumber}`
        });
      }
    }

    // Create hint unlock record
    const pointCost = HINT_COSTS[hintNumber];
    const hintUnlock = new HintUnlock({
      teamId,
      round,
      challengeType: round === 2 ? challengeType : null,
      hintNumber,
      pointCost
    });

    await hintUnlock.save();

    res.status(201).json({
      success: true,
      message: `Hint ${hintNumber} unlocked successfully`,
      hint: hintUnlock,
      pointCost
    });
  } catch (error) {
    console.error('Error unlocking hint:', error);
    res.status(500).json({
      error: 'Failed to unlock hint'
    });
  }
});

// Get total hint penalty for a team/challenge
router.get('/penalty', authenticate, async (req, res) => {
  try {
    const teamId = req.user.teamId;
    const { round, challengeType } = req.query;

    const query = { teamId };
    if (round) query.round = parseInt(round);
    if (challengeType) query.challengeType = challengeType;

    const unlockedHints = await HintUnlock.find(query);
    const totalPenalty = unlockedHints.reduce((sum, hint) => sum + hint.pointCost, 0);

    res.json({
      success: true,
      totalPenalty,
      hintsUnlocked: unlockedHints.length
    });
  } catch (error) {
    console.error('Error calculating hint penalty:', error);
    res.status(500).json({
      error: 'Failed to calculate hint penalty'
    });
  }
});

export default router;

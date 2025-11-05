import express from 'express';
import RoundSession from '../models/RoundSession.js';

const router = express.Router();

// Server-side hint schedule (ms). For production change to hours as needed.
const HINTS = [
  { id: 'h1', unlockOffsetMs: 1 * 60 * 1000 }, // 1 minute (testing)
  { id: 'h2', unlockOffsetMs: 2 * 60 * 1000 }, // 2 minutes
  { id: 'h3', unlockOffsetMs: 3 * 60 * 1000 }, // 3 minutes
  { id: 'h4', unlockOffsetMs: 4 * 60 * 1000 }, // 4 minutes
];

// Start a round session for a team (idempotent)
router.post('/:round/start', async (req, res) => {
  try {
    const { round } = req.params;
    const { teamId } = req.body;

    if (!teamId || typeof teamId !== 'string') {
      return res.status(400).json({ error: 'teamId is required' });
    }

    const roundNum = parseInt(round, 10) || 1;

    let session = await RoundSession.findOne({ teamId, round: roundNum });
    if (!session) {
      session = new RoundSession({ teamId, round: roundNum, startTime: new Date() });
      await session.save();
    }

    return res.json({ success: true, startTime: session.startTime });
  } catch (error) {
    console.error('Start round error:', error);
    res.status(500).json({ error: 'Failed to start round session' });
  }
});

// Get status for a team's round session
router.get('/:round/status', async (req, res) => {
  try {
    const { round } = req.params;
    const { teamId } = req.query;

    if (!teamId || typeof teamId !== 'string') {
      return res.status(400).json({ error: 'teamId query parameter is required' });
    }

    const roundNum = parseInt(round, 10) || 1;
    const session = await RoundSession.findOne({ teamId, round: roundNum });

    if (!session) {
      return res.json({ success: true, started: false, round: roundNum });
    }

    const now = Date.now();
    const startTime = new Date(session.startTime).getTime();
    const elapsedMs = Math.max(0, now - startTime);

    const hints = HINTS.map(h => {
      const unlocked = elapsedMs >= h.unlockOffsetMs;
      return {
        id: h.id,
        unlockOffsetMs: h.unlockOffsetMs,
        unlocked,
        timeLeftMs: unlocked ? 0 : Math.max(0, h.unlockOffsetMs - elapsedMs)
      };
    });

    const unlockedCount = hints.filter(h => h.unlocked).length;
    const total = hints.length;
    const progressPercent = Math.round((unlockedCount / total) * 100);

    res.json({
      success: true,
      started: true,
      round: roundNum,
      startTime: new Date(startTime).toISOString(),
      elapsedMs,
      hints,
      unlockedCount,
      total,
      progressPercent
    });
  } catch (error) {
    console.error('Round status error:', error);
    res.status(500).json({ error: 'Failed to fetch round status' });
  }
});

export default router;

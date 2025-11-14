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

    if (round === 2 && !['android', 'pwn'].includes(challengeType)) {
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

// Get hint content (only if unlocked)
router.get('/content', authenticate, async (req, res) => {
  try {
    const teamId = req.user.teamId;
    const { round, challengeType, hintNumber } = req.query;

    // Validate input
    if (!round || !challengeType || !hintNumber) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const parsedHintNumber = parseInt(hintNumber);
    const parsedRound = parseInt(round);

    // Check if hint is unlocked
    const unlockedHint = await HintUnlock.findOne({
      teamId,
      round: parsedRound,
      challengeType,
      hintNumber: parsedHintNumber
    });

    if (!unlockedHint) {
      return res.status(403).json({
        error: 'Hint not unlocked. Please unlock this hint first.',
        unlocked: false
      });
    }

    // Hint content stored securely on backend
    const hintContent = {
      android: {
        1: {
          title: "Level 1: Initial Reconnaissance",
          hint: "Start by extracting the APK contents. APK files are essentially ZIP archives. Use `unzip` or APK analysis tools like `apktool` to decompile and examine the app structure. Look for interesting directories like `assets/`, `res/`, and database files in the decompiled output."
        },
        2: {
          title: "Level 2: Database Analysis",
          hint: "The app stores encrypted data in a SQLite database. Extract the database file using `adb pull` from the app's data directory (/data/data/com.package.name/databases/). Use SQLite browser or command-line tools to examine tables. Pay special attention to Base64 or hex-encoded strings."
        },
        3: {
          title: "Level 3: Decryption Key",
          hint: "The encryption key is hidden in the native library (.so file) or hardcoded in the Java code. Use `jadx-gui` to decompile the APK and search for keywords like 'key', 'secret', 'decrypt', or 'AES'. The key might be XORed or obfuscated. Look in the MainActivity or database helper classes."
        }
      },
      pwn: {
        1: {
          title: "Level 1: Web Exploitation",
          hint: "Start by enumerating the web application on port 80/443. Test for common vulnerabilities: SQL injection, command injection, file upload, or path traversal. Use tools like `curl`, `Burp Suite`, or `sqlmap`. Focus on input fields and URL parameters. Once you find RCE, establish a reverse shell to get the user flag."
        },
        2: {
          title: "Level 2: Container Enumeration",
          hint: "You're inside a Docker container. Check for common escape vectors: `ls -la /var/run/docker.sock` (Docker socket), `cat /proc/1/cgroup` (container info), `mount | grep docker` (mounted volumes), and `capsh --print` (capabilities). Look for SUID binaries with `find / -perm -4000 2>/dev/null`."
        },
        3: {
          title: "Level 3: Container Escape",
          hint: "The container has a privileged misconfiguration or mounted host filesystem. If Docker socket is accessible, use `docker` commands to spawn a privileged container and mount the host's root filesystem. If there's a host volume mount, pivot to it and access the root flag. Look for paths like `/host`, `/mnt`, or unusual mounts in `/proc/mounts`."
        }
      }
    };

    const content = hintContent[challengeType]?.[parsedHintNumber];

    if (!content) {
      return res.status(404).json({ error: 'Hint content not found' });
    }

    res.json({
      success: true,
      unlocked: true,
      hintNumber: parsedHintNumber,
      title: content.title,
      hint: content.hint,
      pointCost: unlockedHint.pointCost,
      unlockedAt: unlockedHint.unlockedAt
    });
  } catch (error) {
    console.error('Error fetching hint content:', error);
    res.status(500).json({
      error: 'Failed to fetch hint content'
    });
  }
});

export default router;

import express from 'express';
import multer from 'multer';
import path from 'path';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(process.cwd(), 'uploads'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// POST /api/payment/upload
import Team from '../models/Team.js';

router.post('/upload', upload.single('receipt'), async (req, res) => {
  const { teamName } = req.body;
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  if (!teamName) {
    return res.status(400).json({ error: 'Missing teamName' });
  }
  try {
    // Update the team's payment field with the slip filename
    const team = await Team.findOneAndUpdate(
      { teamName },
      { $set: { payment: { slip: req.file.filename } } },
      { new: true }
    );
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }
    res.status(200).json({ message: 'File uploaded and saved to team', filename: req.file.filename });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

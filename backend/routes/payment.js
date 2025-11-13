import express from 'express';
import multer from 'multer';
import { Storage } from '@google-cloud/storage';
import path from 'path';
import Team from '../models/Team.js';

const router = express.Router();

// Multer config for memory storage (buffer)
const upload = multer({ storage: multer.memoryStorage() });

// GCP Storage config - using environment variables for security
const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  keyFilename: path.join(process.cwd(), process.env.GOOGLE_CLOUD_KEY_FILE || 'gcp-service-account.json'),
});
const bucketName = process.env.GOOGLE_CLOUD_STORAGE_BUCKET;

// Validate required GCP environment variables
if (!process.env.GOOGLE_CLOUD_PROJECT_ID || !process.env.GOOGLE_CLOUD_STORAGE_BUCKET) {
  console.error('❌ Missing required GCP environment variables: GOOGLE_CLOUD_PROJECT_ID or GOOGLE_CLOUD_STORAGE_BUCKET');
  console.error('💡 Add them to your .env file or environment configuration');
}

const bucket = storage.bucket(bucketName);

router.post('/upload', upload.single('receipt'), async (req, res) => {
  const { teamName } = req.body;
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  if (!teamName) {
    return res.status(400).json({ error: 'Missing teamName' });
  }

  // Generate a unique filename
  const gcpFilename = Date.now() + '-' + req.file.originalname;
  const blob = bucket.file(gcpFilename);
  const blobStream = blob.createWriteStream({
    resumable: false,
    contentType: req.file.mimetype,
    public: true,
  });

  blobStream.on('error', (err) => {
    return res.status(500).json({ error: err.message });
  });

  blobStream.on('finish', async () => {
    // The public URL can be used to directly access the file via HTTP.
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
    try {
      const team = await Team.findOneAndUpdate(
        { teamName },
        { $set: { payment: { slip: publicUrl } } },
        { new: true }
      );
      if (!team) {
        return res.status(404).json({ error: 'Team not found' });
      }
      res.status(200).json({ message: 'File uploaded to GCP and saved to team', url: publicUrl });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  blobStream.end(req.file.buffer);
});

export default router;
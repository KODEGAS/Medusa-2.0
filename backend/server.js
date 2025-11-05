import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import teamRoutes from './routes/team.js';
import paymentRoutes from './routes/payment.js';
import flagRoutes from './routes/flag.js';
import authRoutes from './routes/auth.js';
import roundsRoutes from './routes/rounds.js';

dotenv.config();

const app = express();

// CORS configuration for production and development
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'http://localhost:8080',
    'http://localhost:8081',
    'http://localhost:8082',
    'https://medusa.ecsc-uok.com',
    'https://www.medusa.ecsc-uok.com'
  ],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());


// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/team', teamRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/flag', flagRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/rounds', roundsRoutes);

const PORT = process.env.PORT || 3001;
const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((error) => console.error('MongoDB connection error:', error));

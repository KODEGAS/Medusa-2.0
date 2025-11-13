import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';

// Environment variables are preloaded via -r dotenv/config in package.json
// This ensures .env is loaded BEFORE any ES6 imports are processed

// Import routes (environment variables are already available)
import teamRoutes from './routes/team.js';
import paymentRoutes from './routes/payment.js';
import flagRoutes from './routes/flag.js';
import authRoutes from './routes/auth.js';
import roundsRoutes from './routes/rounds.js';
import adminRoutes from './routes/admin.js';
import leaderboardRoutes from './routes/leaderboard.js';

const app = express();

// Trust proxy - GCP Cloud Load Balancer Configuration
// Only trust the first proxy (Google Cloud Load Balancer)
// This prevents IP spoofing from malicious X-Forwarded-For headers
app.set('trust proxy', 1);

// Security headers with Helmet
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false, // Allow embedding if needed
  crossOriginResourcePolicy: { policy: "cross-origin" }, // Allow CORS
}));

// Additional security headers
app.use((req, res, next) => {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Enable XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Permissions policy
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  next();
});

// CORS configuration for production and development
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'http://localhost:8080',
    'http://localhost:8081',
    'http://localhost:8082',
    'https://medusa.ecsc-uok.com',
    'https://www.medusa.ecsc-uok.com',
    'https://medusa-2-0.vercel.app',
    'https://medusa-2-0-backend.onrender.com' // Add Render backend for self-requests
  ],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser()); // Parse cookies for JWT authentication


// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/team', teamRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/flag', flagRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/rounds', roundsRoutes);
app.use('/api/leaderboard', leaderboardRoutes);

// Admin routes with obscured path (security through obscurity)
const adminPath = process.env.ADMIN_ROUTE_PATH || '9c8f7e3a2b1d4c5e6f7a8b9c0d1e2f3a';
app.use(`/api/${adminPath}`, adminRoutes);

// Log admin route path on startup (only in development)
if (process.env.NODE_ENV !== 'production') {
  console.log(`🔐 Admin panel accessible at: /api/${adminPath}`);
}

const PORT = process.env.PORT || 3001;
const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((error) => console.error('MongoDB connection error:', error));

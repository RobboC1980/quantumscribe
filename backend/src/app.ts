import express from 'express';
import cors from 'cors';
import compression from 'compression';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import { PrismaClient } from '@prisma/client';

// Initialize Prisma client
const prisma = new PrismaClient();

import authRouter from './routes/auth.js';
import userRouter from './routes/user.js';
import projectsRouter from './routes/projects.js';
import epicRouter from './routes/epics.js';
import billingRouter from './routes/billing.js';
import aiRouter from './routes/ai.js';

const app = express();

// Configure CORS for all environments
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://quantumscribe.vercel.app', /\.vercel\.app$/] 
    : 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  credentials: true
}));

app.use(helmet());
app.use(compression());
app.use(
  rateLimit({ windowMs: 1_000, max: 30, standardHeaders: true, legacyHeaders: false })
);
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));
app.use(express.json({ limit: '10kb' }));

// Add OPTIONS handler for preflight requests
app.options('*', cors());

// Health check endpoint
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

// Register routes
app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/projects', projectsRouter);
app.use('/api', epicRouter);
app.use('/api/billing', billingRouter);
app.use('/api/ai', aiRouter);

// 404 handler
app.use((_req, res) => res.status(404).json({ error: 'Not Found' }));

// Initialize the database and start server if not in serverless environment
const port = process.env.PORT || 4000;

if (process.env.NODE_ENV !== 'production') {
  // Initialize the database before starting the server
  const initDatabase = async () => {
    try {
      await prisma.$connect();
      console.log('Connected to database');
      return true;
    } catch (error) {
      console.error('Failed to connect to database:', error);
      return false;
    }
  };

  initDatabase()
    .then(() => {
      app.listen(port, () => console.log(`🚀 Backend ready on :${port}`));
    })
    .catch(err => {
      console.error('Failed to initialize database:', err);
      process.exit(1);
    });
} else {
  // In production, just connect to the database
  prisma.$connect()
    .then(() => console.log('Connected to database in serverless environment'))
    .catch(err => console.error('Failed to connect to database in serverless environment:', err));
}

// Export the Express app for serverless functions
export default app;

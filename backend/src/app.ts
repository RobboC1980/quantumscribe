import express from 'express';
import cors from 'cors';
import compression from 'compression';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import { supabase } from './utils/supabase.js';

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

// Initialize and start server
const port = process.env.PORT || 4000;

if (process.env.NODE_ENV !== 'production') {
  // Check Supabase connection before starting the server
  const checkConnection = async () => {
    try {
      const { data, error } = await supabase.from('healthcheck').select('*').limit(1);
      if (error) throw error;
      console.log('Connected to Supabase database');
      return true;
    } catch (error) {
      console.error('Failed to connect to Supabase database:', error);
      return false;
    }
  };

  checkConnection()
    .then(() => {
      app.listen(port, () => console.log(`🚀 Backend ready on :${port}`));
    })
    .catch(err => {
      console.error('Failed to initialize database connection:', err);
      process.exit(1);
    });
} else {
  // In production (serverless), we don't need to explicitly check the connection
  app.listen(port, () => console.log(`🚀 Backend ready on :${port}`));
}

// Export the Express app for serverless functions
export default app;

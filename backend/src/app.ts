import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';

import authRouter from './routes/auth.js';
import projectsRouter from './routes/projects.js';

const app = express();

app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// auth endpoints
app.use('/api/auth', authRouter);
app.use('/api/projects', projectsRouter);

app.use((_req, res) => res.status(404).json({ error: 'Not Found' }));

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`🚀 Backend ready on :${port}`));

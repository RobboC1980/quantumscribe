import { Router } from 'express';
import jwt from 'jsonwebtoken';

const router = Router();

router.post('/login', (req, res) => {
  // placeholder: validate user
  const token = jwt.sign({ userId: 1 }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
  return res.json({ token });
});

router.post('/register', (_req, res) => {
  return res.status(201).json({ message: 'User registered (stub)' });
});

router.get('/me', (_req, res) => {
  return res.json({ id: 1, email: 'demo@example.com' });
});

export default router;

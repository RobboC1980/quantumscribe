import { Request, Response, NextFunction } from 'express';
import { verify } from '../services/auth.service.js';

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthenticated' });
  try {
    const payload = verify(header.split(' ')[1]);
    (req as any).userId = payload.sub;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

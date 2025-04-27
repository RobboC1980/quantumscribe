import { Request, Response } from 'express';

// Very restrictive CORS for production
export function cors(req: Request, res: Response) {
  res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || '');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization'
  );
}

// Guard against unsupported methods
export function allowMethods(req: Request, res: Response, methods: string[] = []) {
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return false;
  }
  if (!methods.includes(req.method || '')) {
    res.setHeader('Allow', methods.join(', '));
    res.status(405).json({ error: 'Method Not Allowed' });
    return false;
  }
  return true;
} 
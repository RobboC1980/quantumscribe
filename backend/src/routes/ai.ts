import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { stream } from '../services/ai.service.js';
import { Broadcast } from 'sse-broadcast';

const r = Router();
r.post('/completion', requireAuth, async (req: Request, res: Response) => {
  const { provider = 'openai', prompt } = req.body as { provider: string; prompt: string };

  // Set up Server-Sent Events
  const sse = new Broadcast();
  sse.subscribe(req, res);

  (async () => {
    for await (const chunk of stream(provider as any, [{ role: 'user', content: prompt }])) {
      sse.publish(chunk);
    }
    sse.publish('[END]');
    res.end();
  })().catch(err => {
    console.error(err);
    res.end();
  });
});

export default r; 
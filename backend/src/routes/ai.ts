import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { stream } from '../services/ai.service.js';

const r = Router();
r.post('/completion', requireAuth, async (req: Request, res: Response) => {
  const { provider = 'openai', prompt } = req.body as { provider: string; prompt: string };

  // Configure Server-Sent Events (SSE) headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive'
  });

  // Kick-start the stream so that the client receives the headers immediately
  res.write('\n');

  try {
    for await (const chunk of stream(provider as any, [{ role: 'user', content: prompt }])) {
      if (chunk) {
        // Ensure each message is on its own line followed by a blank line as per SSE spec
        res.write(`data: ${chunk.replace(/\n/g, ' ')}\n\n`);
      }
    }
    res.write('data: [END]\n\n');
  } catch (err) {
    console.error('AI stream error:', err);
    res.write('data: [ERROR]\n\n');
  } finally {
    res.end();
  }
});

export default r; 
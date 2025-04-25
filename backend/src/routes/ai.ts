import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { askAI } from '../services/ai.service.js';

const router = Router();

// AI completion endpoint
router.post('/complete', authenticate, async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }
    
    const completion = await askAI(prompt);
    res.json({ completion });
  } catch (error) {
    console.error('AI error:', error);
    res.status(500).json({ error: 'AI service is currently unavailable' });
  }
});

// AI stream endpoint (for SSE - Server-Sent Events)
router.post('/stream', authenticate, async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }
    
    // Set headers for SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    
    // Stream logic would go here
    // This is a simplified example
    res.write(`data: ${JSON.stringify({ text: "AI streaming not implemented yet" })}\n\n`);
    res.end();
  } catch (error) {
    console.error('AI streaming error:', error);
    res.status(500).json({ error: 'AI streaming service is currently unavailable' });
  }
});

export default router; 
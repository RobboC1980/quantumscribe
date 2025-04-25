import { VercelRequest, VercelResponse } from '@vercel/node';
import { register } from '../../src/services/auth.service.js';
import cors from 'cors';
import express from 'express';

const app = express();

// Configure CORS
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://quantumscribe.vercel.app', /\.vercel\.app$/] 
    : 'http://localhost:3000',
  methods: ['POST', 'OPTIONS'],
  credentials: true
}));

app.use(express.json());

// Serverless function handler for registration
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { email, password } = req.body;
    
    // Basic validation
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email and password are required' 
      });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ 
        error: 'Password must be at least 6 characters long' 
      });
    }
    
    // Attempt to register the user
    const token = await register(email, password);
    res.status(201).json({ token });
  } catch (e: any) {
    console.error('Registration error:', e.message);
    
    // Handle specific errors
    if (e.message.includes('already exists')) {
      return res.status(409).json({ error: e.message });
    }
    
    res.status(400).json({ error: e.message });
  }
} 
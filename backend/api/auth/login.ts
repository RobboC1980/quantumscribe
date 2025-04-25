import { VercelRequest, VercelResponse } from '@vercel/node';
import { login } from '../../src/services/auth.service.js';
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

// Serverless function handler for login
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
    
    // Attempt to login
    const token = await login(email, password);
    res.json({ token });
  } catch (e: any) {
    console.error('Login error:', e.message);
    
    // For security, use a generic error message
    res.status(401).json({ 
      error: 'Invalid credentials'
    });
  }
} 
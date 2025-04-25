import { Router } from 'express';
import { login, register } from '../services/auth.service.js';

const router = Router();

// Registration endpoint
router.post('/register', async (req, res) => {
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
});

// Login endpoint
router.post('/login', async (req, res) => {
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
});

export default router;

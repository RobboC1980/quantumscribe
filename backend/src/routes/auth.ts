import { Router } from 'express';
import { login, register, refreshSession, signOut } from '../services/auth.service.js';

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
    const result = await register(email, password);
    res.status(201).json(result);
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
    const result = await login(email, password);
    res.json(result);
  } catch (e: any) {
    console.error('Login error:', e.message);
    
    // For security, use a generic error message
    res.status(401).json({ 
      error: 'Invalid credentials'
    });
  }
});

// Session refresh endpoint
router.post('/refresh', async (req, res) => {
  try {
    const { refresh_token } = req.body;
    
    if (!refresh_token) {
      return res.status(400).json({ error: 'Refresh token is required' });
    }
    
    const result = await refreshSession(refresh_token);
    res.json(result);
  } catch (e: any) {
    console.error('Session refresh error:', e.message);
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});

// Logout endpoint
router.post('/logout', async (req, res) => {
  try {
    const { session_id } = req.body;
    
    if (!session_id) {
      return res.status(400).json({ error: 'Session ID is required' });
    }
    
    await signOut(session_id);
    res.json({ success: true });
  } catch (e: any) {
    console.error('Logout error:', e.message);
    res.status(500).json({ error: 'Failed to logout' });
  }
});

export default router;

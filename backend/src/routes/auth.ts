import { Router } from 'express';
import { login, register, refreshSession, signOut, resetPasswordForEmail, updateUserPassword } from '../services/auth.service';
import { cors, allowMethods } from '../middleware/auth';
import { validateEmail, validatePassword } from '../utils/validators';

const router = Router();

// Registration endpoint
router.post('/register', async (req, res) => {
  // Apply CORS headers
  cors(req, res);
  if (!allowMethods(req, res, ['POST'])) return;

  try {
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }
    
    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    
    if (!validatePassword(password)) {
      return res.status(400).json({ 
        error: 'Password must be at least 6 characters' 
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
  // Apply CORS headers
  cors(req, res);
  if (!allowMethods(req, res, ['POST'])) return;

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
    res.json({
      user: result.user,
      session: {
        access_token: result.session.access_token,
        refresh_token: result.session.refresh_token,
        expires_at: result.session.expires_at
      }
    });
  } catch (e: any) {
    console.error('Login error:', e.message);
    
    // Use status code from error object or default to 401
    const statusCode = e.status || 401;
    res.status(statusCode).json({ 
      error: e.message || 'Authentication failed'
    });
  }
});

// Session refresh endpoint
router.post('/refresh', async (req, res) => {
  // Apply CORS headers
  cors(req, res);
  if (!allowMethods(req, res, ['POST'])) return;

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
  // Apply CORS headers
  cors(req, res);
  if (!allowMethods(req, res, ['POST'])) return;

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

// Forgot password endpoint
router.post('/forgot-password', async (req, res) => {
  // Apply CORS headers
  cors(req, res);
  if (!allowMethods(req, res, ['POST'])) return;

  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    
    await resetPasswordForEmail(email);
    res.json({ success: true, message: 'Password reset email sent' });
  } catch (e: any) {
    console.error('Password reset error:', e.message);
    res.status(400).json({ error: e.message });
  }
});

// Reset password endpoint
router.post('/reset-password', async (req, res) => {
  // Apply CORS headers
  cors(req, res);
  if (!allowMethods(req, res, ['POST'])) return;

  try {
    const { user_id, password } = req.body;
    
    if (!user_id || !password) {
      return res.status(400).json({ error: 'User ID and password are required' });
    }
    
    if (!validatePassword(password)) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    
    await updateUserPassword(user_id, password);
    res.json({ success: true, message: 'Password has been reset' });
  } catch (e: any) {
    console.error('Password update error:', e.message);
    res.status(400).json({ error: e.message });
  }
});

export default router;

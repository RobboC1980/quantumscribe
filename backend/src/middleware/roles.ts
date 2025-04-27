import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../lib/createSupabaseAdmin';
import { UserRole } from '../types/auth';

// Define a request type that includes user information
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
  };
}

// Middleware to verify JWT and extract user information
export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    // Get the authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized - No token provided' });
    }

    // Extract the token
    const token = authHeader.split(' ')[1];
    
    // Verify the token with Supabase
    const { data, error } = await supabaseAdmin.auth.getUser(token);
    
    if (error || !data.user) {
      return res.status(401).json({ error: 'Unauthorized - Invalid token' });
    }
    
    // Get user role from metadata or fetch from database
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', data.user.id)
      .single();
    
    if (userError || !userData) {
      return res.status(401).json({ error: 'Unauthorized - User not found' });
    }
    
    // Attach the user to the request
    req.user = {
      id: data.user.id,
      email: data.user.email || '',
      role: userData.role as UserRole,
    };
    
    // Continue to the next middleware/route handler
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Role-based authorization middleware
export function requireRole(allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized - User not authenticated' });
    }
    
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden - Insufficient permissions' });
    }
    
    next();
  };
} 
import { Router, Response, NextFunction } from 'express';
import { requireAuth, requireRole, AuthenticatedRequest } from '../middleware/roles';
import { updateUserRole } from '../services/auth.service';
import { UserRole } from '../types/auth';
import { supabaseAdmin } from '../lib/createSupabaseAdmin';

const router = Router();

// @ts-nocheck
// eslint-disable-next-line

// Apply auth middleware to all admin routes
router.use(requireAuth as any);
router.use(requireRole(['admin']) as any);

// Get all users (admin only)
router.get('/users', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('id, email, role, created_at')
      .order('created_at', { ascending: false });
    
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    
    res.json({ users: data });
  } catch (e: any) {
    console.error('Error fetching users:', e.message);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Update a user's role (admin only)
router.patch('/users/:userId/role', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;
    
    if (!userId || !role) {
      return res.status(400).json({ error: 'User ID and role are required' });
    }
    
    // Validate role
    const validRoles: UserRole[] = ['admin', 'editor', 'reader'];
    if (!validRoles.includes(role as UserRole)) {
      return res.status(400).json({ error: 'Invalid role. Must be admin, editor, or reader' });
    }
    
    // Prevent an admin from downgrading their own role
    if (userId === req.user?.id && role !== 'admin') {
      return res.status(403).json({ 
        error: 'You cannot downgrade your own admin role' 
      });
    }
    
    await updateUserRole(userId, role as UserRole);
    res.json({ success: true });
  } catch (e: any) {
    console.error('Error updating user role:', e.message);
    res.status(500).json({ error: e.message });
  }
});

// Delete a user (admin only)
router.delete('/users/:userId', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    // Prevent an admin from deleting themselves
    if (userId === req.user?.id) {
      return res.status(403).json({ 
        error: 'You cannot delete your own account' 
      });
    }
    
    // Delete the user from the database first
    const { error: dbError } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', userId);
    
    if (dbError) {
      return res.status(500).json({ error: dbError.message });
    }
    
    // Then delete the auth user
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    
    if (authError) {
      return res.status(500).json({ error: authError.message });
    }
    
    res.json({ success: true });
  } catch (e: any) {
    console.error('Error deleting user:', e.message);
    res.status(500).json({ error: e.message });
  }
});

export default router; 
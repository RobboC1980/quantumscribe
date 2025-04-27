import { Router, Response } from 'express';
import { requireAuth, requireRole, AuthenticatedRequest } from '../middleware/roles';
import { supabaseAdmin } from '../lib/createSupabaseAdmin';

const router = Router();

// Apply authentication to all project routes
router.use(requireAuth as any);

// Get all accessible projects (filtered by RLS policies)
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('my_accessible_projects')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    
    res.json({ projects: data });
  } catch (e: any) {
    console.error('Error fetching projects:', e.message);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// Get a single project (if user has access)
router.get('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabaseAdmin
      .from('projects')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    
    if (!data) {
      return res.status(404).json({ error: 'Project not found or you don\'t have access' });
    }
    
    res.json({ project: data });
  } catch (e: any) {
    console.error('Error fetching project:', e.message);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

// Create a new project
router.post('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, description, is_public } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Project name is required' });
    }
    
    const { data, error } = await supabaseAdmin
      .from('projects')
      .insert({
        name,
        description: description || '',
        owner_id: req.user!.id,
        is_public: is_public || false
      })
      .select()
      .single();
    
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    
    res.status(201).json({ project: data });
  } catch (e: any) {
    console.error('Error creating project:', e.message);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// Update a project (owner or editor role required)
router.put('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, is_public } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Project name is required' });
    }
    
    // If user is not admin, verify they have access
    if (req.user?.role !== 'admin') {
      // Check if user is owner
      const { data: projectData } = await supabaseAdmin
        .from('projects')
        .select('owner_id')
        .eq('id', id)
        .single();
      
      // If not owner, check if user is an editor
      if (projectData?.owner_id !== req.user?.id) {
        const { data: memberData } = await supabaseAdmin
          .from('project_members')
          .select('role')
          .eq('project_id', id)
          .eq('user_id', req.user?.id)
          .single();
        
        if (!memberData || memberData.role !== 'editor') {
          return res.status(403).json({ error: 'You don\'t have permission to update this project' });
        }
      }
    }
    
    const { data, error } = await supabaseAdmin
      .from('projects')
      .update({
        name,
        description: description || '',
        is_public: is_public || false,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    
    if (!data) {
      return res.status(404).json({ error: 'Project not found or you don\'t have access to update it' });
    }
    
    res.json({ project: data });
  } catch (e: any) {
    console.error('Error updating project:', e.message);
    res.status(500).json({ error: 'Failed to update project' });
  }
});

// Delete a project (owner or admin role required)
router.delete('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    // If not admin, verify ownership
    if (req.user?.role !== 'admin') {
      const { data: project } = await supabaseAdmin
        .from('projects')
        .select('owner_id')
        .eq('id', id)
        .single();
      
      if (!project || project.owner_id !== req.user?.id) {
        return res.status(403).json({ error: 'You don\'t have permission to delete this project' });
      }
    }
    
    const { error } = await supabaseAdmin
      .from('projects')
      .delete()
      .eq('id', id);
    
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    
    res.json({ success: true });
  } catch (e: any) {
    console.error('Error deleting project:', e.message);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

// Project members management (admin routes)
// Get all members of a project
router.get('/:id/members', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    // Check if user has access to the project
    const { data: project } = await supabaseAdmin
      .from('projects')
      .select('owner_id')
      .eq('id', id)
      .single();
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    // If not owner or admin, check if user is a member
    if (project.owner_id !== req.user?.id && req.user?.role !== 'admin') {
      const { data: membership } = await supabaseAdmin
        .from('project_members')
        .select('*')
        .eq('project_id', id)
        .eq('user_id', req.user?.id)
        .single();
      
      if (!membership) {
        return res.status(403).json({ error: 'You don\'t have access to this project' });
      }
    }
    
    const { data, error } = await supabaseAdmin
      .from('project_members')
      .select('*, users:user_id(id, email, role)')
      .eq('project_id', id);
    
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    
    res.json({ members: data });
  } catch (e: any) {
    console.error('Error fetching project members:', e.message);
    res.status(500).json({ error: 'Failed to fetch project members' });
  }
});

// Add a member to a project (owner or admin only)
router.post('/:id/members', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { user_id, role } = req.body;
    
    if (!user_id || !role) {
      return res.status(400).json({ error: 'User ID and role are required' });
    }
    
    if (!['editor', 'reader'].includes(role)) {
      return res.status(400).json({ error: 'Role must be either "editor" or "reader"' });
    }
    
    // If not admin, verify ownership
    if (req.user?.role !== 'admin') {
      const { data: project } = await supabaseAdmin
        .from('projects')
        .select('owner_id')
        .eq('id', id)
        .single();
      
      if (!project || project.owner_id !== req.user?.id) {
        return res.status(403).json({ error: 'Only the project owner or an admin can add members' });
      }
    }
    
    const { data, error } = await supabaseAdmin
      .from('project_members')
      .insert({
        project_id: id,
        user_id,
        role
      })
      .select()
      .single();
    
    if (error) {
      if (error.code === '23505') { // unique violation
        return res.status(409).json({ error: 'User is already a member of this project' });
      }
      return res.status(500).json({ error: error.message });
    }
    
    res.status(201).json({ member: data });
  } catch (e: any) {
    console.error('Error adding project member:', e.message);
    res.status(500).json({ error: 'Failed to add project member' });
  }
});

export default router;

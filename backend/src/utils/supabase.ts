import { createClient } from '@supabase/supabase-js';

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

// Create and export the Supabase client (server-side with admin rights)
export const supabase = createClient(supabaseUrl, supabaseKey);

// Create a public client with limited permissions (for frontend-like operations)
export const supabasePublic = createClient(supabaseUrl, supabaseAnonKey);

// Helper functions for common database operations
export const db = {
  // Users
  async getUserById(id: string) {
    return supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
  },
  
  async getUserByEmail(email: string) {
    return supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
  },
  
  async getUserProfile(userId: string) {
    return supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();
  },
  
  async updateUserProfile(userId: string, data: { display_name?: string, avatar_url?: string }) {
    return supabase
      .from('user_profiles')
      .update({
        ...data,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();
  },
  
  // Projects
  async getProjects(userId: string) {
    return supabase
      .from('projects')
      .select('*')
      .eq('owner_id', userId);
  },
  
  async getProjectById(id: string) {
    return supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();
  },
  
  async createProject(ownerId: string, name: string, description: string = '') {
    return supabase
      .from('projects')
      .insert({
        owner_id: ownerId,
        name,
        description
      })
      .select()
      .single();
  },
  
  async updateProject(id: string, data: { name?: string, description?: string }) {
    return supabase
      .from('projects')
      .update({
        ...data,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
  },
  
  async deleteProject(id: string) {
    return supabase
      .from('projects')
      .delete()
      .eq('id', id);
  },
  
  // Epics
  async getEpicsByProjectId(projectId: string) {
    return supabase
      .from('epics')
      .select('*')
      .eq('project_id', projectId)
      .order('sort_order', { ascending: true });
  },
  
  async createEpic(projectId: string, title: string, description: string = '', sortOrder: number = 0) {
    return supabase
      .from('epics')
      .insert({
        project_id: projectId,
        title,
        description,
        sort_order: sortOrder
      })
      .select()
      .single();
  },
  
  // Stories
  async getStoriesByEpicId(epicId: string) {
    return supabase
      .from('stories')
      .select('*')
      .eq('epic_id', epicId)
      .order('sort_order', { ascending: true });
  },
  
  async createStory(epicId: string, title: string, description: string = '', status: 'todo' | 'in_progress' | 'done' = 'todo', sortOrder: number = 0) {
    return supabase
      .from('stories')
      .insert({
        epic_id: epicId,
        title,
        description,
        status,
        sort_order: sortOrder
      })
      .select()
      .single();
  },
  
  async updateStoryStatus(id: string, status: 'todo' | 'in_progress' | 'done') {
    return supabase
      .from('stories')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
  }
};

// Auth helper methods
export const auth = {
  async signUp(email: string, password: string) {
    return supabase.auth.signUp({
      email,
      password
    });
  },
  
  async signIn(email: string, password: string) {
    return supabase.auth.signInWithPassword({
      email,
      password
    });
  },
  
  async signOut() {
    return supabase.auth.signOut();
  },
  
  async getCurrentUser() {
    return supabase.auth.getUser();
  },
  
  async refreshSession(refreshToken: string) {
    return supabase.auth.refreshSession({ refresh_token: refreshToken });
  },
  
  async resetPasswordForEmail(email: string) {
    return supabase.auth.resetPasswordForEmail(email);
  },
  
  async updateUserPassword(userId: string, password: string) {
    return supabase.auth.admin.updateUserById(userId, { password });
  },
  
  async inviteUserByEmail(email: string) {
    return supabase.auth.admin.inviteUserByEmail(email);
  }
};

// Storage helper methods
export const storage = {
  async uploadFile(bucket: string, path: string, file: File) {
    return supabase.storage.from(bucket).upload(path, file);
  },
  
  async downloadFile(bucket: string, path: string) {
    return supabase.storage.from(bucket).download(path);
  },
  
  getPublicUrl(bucket: string, path: string) {
    return supabase.storage.from(bucket).getPublicUrl(path);
  },
  
  async listFiles(bucket: string, path: string) {
    return supabase.storage.from(bucket).list(path);
  },
  
  async removeFile(bucket: string, path: string) {
    return supabase.storage.from(bucket).remove([path]);
  }
};

export default supabase; 
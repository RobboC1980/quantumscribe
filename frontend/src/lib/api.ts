import { supabase } from './supabase';

/**
 * Project API functions
 */
export const ProjectAPI = {
  /**
   * Get all projects for the current user
   */
  getProjects: async () => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },
  
  /**
   * Get a specific project by ID
   */
  getProject: async (projectId: string) => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();
    
    if (error) throw error;
    return data;
  },
  
  /**
   * Create a new project
   */
  createProject: async (project: { name: string; description: string }) => {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    
    const { data, error } = await supabase
      .from('projects')
      .insert({
        ...project,
        owner_id: userData.user.id
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
  
  /**
   * Update a project
   */
  updateProject: async (projectId: string, updates: { name?: string; description?: string }) => {
    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', projectId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
  
  /**
   * Delete a project
   */
  deleteProject: async (projectId: string) => {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId);
    
    if (error) throw error;
    return true;
  }
};

/**
 * Epic API functions
 */
export const EpicAPI = {
  /**
   * Get all epics for a project
   */
  getEpics: async (projectId: string) => {
    const { data, error } = await supabase
      .from('epics')
      .select('*')
      .eq('project_id', projectId)
      .order('sort_order', { ascending: true });
    
    if (error) throw error;
    return data;
  },
  
  /**
   * Create a new epic
   */
  createEpic: async (epic: { projectId: string; title: string; description?: string }) => {
    // Get maximum sort order first
    const { data: existingEpics, error: fetchError } = await supabase
      .from('epics')
      .select('sort_order')
      .eq('project_id', epic.projectId)
      .order('sort_order', { ascending: false })
      .limit(1);
    
    if (fetchError) throw fetchError;
    
    const sortOrder = existingEpics && existingEpics.length > 0 
      ? (existingEpics[0].sort_order + 1) 
      : 0;
    
    const { data, error } = await supabase
      .from('epics')
      .insert({
        project_id: epic.projectId,
        title: epic.title,
        description: epic.description || '',
        sort_order: sortOrder
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

/**
 * Story API functions
 */
export const StoryAPI = {
  /**
   * Get all stories for an epic
   */
  getStories: async (epicId: string) => {
    const { data, error } = await supabase
      .from('stories')
      .select('*')
      .eq('epic_id', epicId)
      .order('sort_order', { ascending: true });
    
    if (error) throw error;
    return data;
  },
  
  /**
   * Create a new story
   */
  createStory: async (story: { epicId: string; title: string; description?: string }) => {
    // Get maximum sort order first
    const { data: existingStories, error: fetchError } = await supabase
      .from('stories')
      .select('sort_order')
      .eq('epic_id', story.epicId)
      .order('sort_order', { ascending: false })
      .limit(1);
    
    if (fetchError) throw fetchError;
    
    const sortOrder = existingStories && existingStories.length > 0 
      ? (existingStories[0].sort_order + 1) 
      : 0;
    
    const { data, error } = await supabase
      .from('stories')
      .insert({
        epic_id: story.epicId,
        title: story.title,
        description: story.description || '',
        sort_order: sortOrder,
        status: 'todo'
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
  
  /**
   * Update a story's status
   */
  updateStoryStatus: async (storyId: string, status: 'todo' | 'in_progress' | 'done') => {
    const { data, error } = await supabase
      .from('stories')
      .update({ status })
      .eq('id', storyId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
}; 
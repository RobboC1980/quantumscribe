-- First add the is_public column to projects table
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT FALSE;

-- Create the users table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'reader' CHECK (role IN ('admin', 'editor', 'reader')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create the projects table (example for demonstrating RLS)
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create project_members junction table
CREATE TABLE IF NOT EXISTS public.project_members (
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'reader' CHECK (role IN ('editor', 'reader')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (project_id, user_id)
);

-- Enable Row Level Security on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;

-- Create policies for the users table
-- 1. Users can see their own data
CREATE POLICY users_read_own ON public.users
  FOR SELECT
  USING (auth.uid() = id);

-- 2. Admins can see all user data
CREATE POLICY users_read_all_admin ON public.users
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 3. Users can update their own data (except role)
CREATE POLICY users_update_own ON public.users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND role = (SELECT role FROM public.users WHERE id = auth.uid())
  );

-- 4. Admins can update any user's data
CREATE POLICY users_update_admin ON public.users
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 5. Only admins can delete users
CREATE POLICY users_delete_admin ON public.users
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Update policies for the projects table
-- Remove existing policies first
DROP POLICY IF EXISTS "Users can view their own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can insert their own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can update their own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can delete their own projects" ON public.projects;

-- 1. Owners can read their projects
CREATE POLICY projects_read_own ON public.projects
  FOR SELECT
  USING (auth.uid() = owner_id);

-- 2. Members can read projects they're a member of
CREATE POLICY projects_read_member ON public.projects
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.project_members
      WHERE project_id = projects.id AND user_id = auth.uid()
    )
  );

-- 3. Public projects are visible to all authenticated users
CREATE POLICY projects_read_public ON public.projects
  FOR SELECT
  USING (is_public = TRUE);

-- 4. Owners can update their projects
CREATE POLICY projects_update_own ON public.projects
  FOR UPDATE
  USING (auth.uid() = owner_id);

-- 5. Editors can update projects they have access to
CREATE POLICY projects_update_editor ON public.projects
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.project_members
      WHERE 
        project_id = projects.id AND 
        user_id = auth.uid() AND 
        role = 'editor'
    )
  );

-- 6. Only project owners can delete their projects
CREATE POLICY projects_delete_own ON public.projects
  FOR DELETE
  USING (auth.uid() = owner_id);

-- 7. Admins can manage all projects
CREATE POLICY projects_admin_all ON public.projects
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 8. Insert policy for owners
CREATE POLICY projects_insert_own ON public.projects
  FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

-- Policies for project_members table
-- 1. Project owners can manage project members
CREATE POLICY project_members_owner ON public.project_members
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE id = project_members.project_id AND owner_id = auth.uid()
    )
  );

-- 2. Members can see other members in their projects
CREATE POLICY project_members_read ON public.project_members
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.project_members AS pm
      WHERE pm.project_id = project_members.project_id AND pm.user_id = auth.uid()
    )
  );

-- 3. Admins can manage all project members
CREATE POLICY project_members_admin ON public.project_members
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create or replace a function to get projects a user has access to
CREATE OR REPLACE FUNCTION public.get_accessible_projects(user_uuid UUID)
RETURNS SETOF public.projects AS $$
BEGIN
  -- Check if user is admin
  IF EXISTS (SELECT 1 FROM public.users WHERE id = user_uuid AND role = 'admin') THEN
    -- Admins can see all projects
    RETURN QUERY SELECT * FROM public.projects;
  ELSE
    -- Return projects where the user is owner, member, or project is public
    RETURN QUERY
      SELECT p.* FROM public.projects p
      WHERE
        p.owner_id = user_uuid
        OR EXISTS (
          SELECT 1 FROM public.project_members pm
          WHERE pm.project_id = p.id AND pm.user_id = user_uuid
        )
        OR p.is_public = TRUE;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a view for users to easily get their accessible projects
CREATE OR REPLACE VIEW public.my_accessible_projects AS
  SELECT * FROM public.get_accessible_projects(auth.uid()); 
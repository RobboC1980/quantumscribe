-- Create schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS public;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Set timezone to UTC
ALTER DATABASE postgres SET timezone TO 'UTC';

-- Projects Table
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on projects
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Project policies
CREATE POLICY "Users can view their own projects" 
  ON public.projects FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can insert their own projects" 
  ON public.projects FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own projects" 
  ON public.projects FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own projects" 
  ON public.projects FOR DELETE
  USING (auth.uid() = owner_id);

-- Epics Table
CREATE TABLE IF NOT EXISTS public.epics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on epics
ALTER TABLE public.epics ENABLE ROW LEVEL SECURITY;

-- Epic policies (through project ownership)
CREATE POLICY "Users can view their own epics" 
  ON public.epics FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.projects 
    WHERE projects.id = epics.project_id AND projects.owner_id = auth.uid()
  ));

CREATE POLICY "Users can insert their own epics" 
  ON public.epics FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.projects 
    WHERE projects.id = epics.project_id AND projects.owner_id = auth.uid()
  ));

CREATE POLICY "Users can update their own epics" 
  ON public.epics FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.projects 
    WHERE projects.id = epics.project_id AND projects.owner_id = auth.uid()
  ));

CREATE POLICY "Users can delete their own epics" 
  ON public.epics FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.projects 
    WHERE projects.id = epics.project_id AND projects.owner_id = auth.uid()
  ));

-- Create enum for story status
CREATE TYPE public.story_status AS ENUM ('todo', 'in_progress', 'done');

-- Stories Table
CREATE TABLE IF NOT EXISTS public.stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  epic_id UUID NOT NULL REFERENCES public.epics(id) ON DELETE CASCADE,
  status public.story_status DEFAULT 'todo',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on stories
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;

-- Story policies (through epic and project ownership)
CREATE POLICY "Users can view their own stories" 
  ON public.stories FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.epics
    JOIN public.projects ON epics.project_id = projects.id
    WHERE stories.epic_id = epics.id AND projects.owner_id = auth.uid()
  ));

CREATE POLICY "Users can insert their own stories" 
  ON public.stories FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.epics
    JOIN public.projects ON epics.project_id = projects.id
    WHERE stories.epic_id = epics.id AND projects.owner_id = auth.uid()
  ));

CREATE POLICY "Users can update their own stories" 
  ON public.stories FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.epics
    JOIN public.projects ON epics.project_id = projects.id
    WHERE stories.epic_id = epics.id AND projects.owner_id = auth.uid()
  ));

CREATE POLICY "Users can delete their own stories" 
  ON public.stories FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.epics
    JOIN public.projects ON epics.project_id = projects.id
    WHERE stories.epic_id = epics.id AND projects.owner_id = auth.uid()
  ));

-- Create a healthcheck table for connection testing
CREATE TABLE IF NOT EXISTS public.healthcheck (
  id SERIAL PRIMARY KEY,
  status TEXT DEFAULT 'ok',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Allow anyone to select from healthcheck
ALTER TABLE public.healthcheck ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow healthcheck reads" ON public.healthcheck FOR SELECT USING (true);

-- Insert initial healthcheck record
INSERT INTO public.healthcheck (status) VALUES ('ok') ON CONFLICT DO NOTHING;

-- Create functions for user profile management
-- This function creates a public.profiles record for a new user
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create user_profiles table for additional user data
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on user_profiles
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- User profile policies
CREATE POLICY "Users can view any profile" 
  ON public.user_profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile" 
  ON public.user_profiles FOR UPDATE
  USING (auth.uid() = id);

-- Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user(); 
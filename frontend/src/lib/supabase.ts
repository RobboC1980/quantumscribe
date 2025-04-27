import { createClient, AuthError } from '@supabase/supabase-js';

// Define types for import.meta.env from Vite
declare global {
  interface ImportMeta {
    env: {
      VITE_SUPABASE_URL?: string;
      VITE_SUPABASE_ANON_KEY?: string;
      [key: string]: any;
    };
  }
}

// Get environment variables from import.meta.env (Vite)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Authentication helper functions

/**
 * Sign up a new user with email and password
 */
export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  
  return { data, error };
}

/**
 * Sign in a user with email and password
 */
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  return { data, error };
}

/**
 * Sign out the current user
 */
export async function signOut() {
  return await supabase.auth.signOut();
}

/**
 * Get the current logged in user
 */
export async function getCurrentUser() {
  const { data } = await supabase.auth.getUser();
  return data?.user;
}

/**
 * Get the current session
 */
export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

// Add a listener for auth changes
export function onAuthStateChange(callback: (event: string, session: any) => void) {
  return supabase.auth.onAuthStateChange(callback);
} 
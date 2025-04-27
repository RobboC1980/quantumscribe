import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/env.js';
import { supabase, auth as supabaseAuth } from '../utils/supabase.js';

const SALT_ROUNDS = 10;

export async function register(email: string, password: string) {
  // Use Supabase Auth for user registration
  const { data, error } = await supabaseAuth.signUp(email, password);
  
  if (error) {
    if (error.message.includes('already exists')) {
      throw new Error('User with this email already exists');
    }
    throw new Error(error.message);
  }
  
  if (!data.user) {
    throw new Error('Failed to create user');
  }
  
  // Return both the JWT and the Supabase session for frontend usage
  return {
    token: sign(data.user.id),
    session: data.session,
    user: {
      id: data.user.id,
      email: data.user.email
    }
  };
}

export async function login(email: string, password: string) {
  // Use Supabase Auth for login
  const { data, error } = await supabaseAuth.signIn(email, password);
  
  if (error) {
    throw new Error('Invalid credentials');
  }
  
  if (!data.user) {
    throw new Error('Invalid credentials');
  }
  
  // Return both the JWT and the Supabase session for frontend usage
  return {
    token: sign(data.user.id),
    session: data.session,
    user: {
      id: data.user.id,
      email: data.user.email
    }
  };
}

export async function refreshSession(refreshToken: string) {
  const { data, error } = await supabase.auth.refreshSession({ refresh_token: refreshToken });
  
  if (error) {
    throw new Error('Failed to refresh session');
  }
  
  if (!data.user || !data.session) {
    throw new Error('No session to refresh');
  }
  
  return {
    token: sign(data.user.id),
    session: data.session,
    user: {
      id: data.user.id,
      email: data.user.email || ''
    }
  };
}

export async function signOut(sessionId: string) {
  const { error } = await supabase.auth.admin.signOut(sessionId);
  
  if (error) {
    throw new Error('Failed to sign out');
  }
  
  return { success: true };
}

function sign(userId: string) {
  return jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: '7d' });
}

export function verify(token: string) {
  return jwt.verify(token, JWT_SECRET) as { sub: string };
} 
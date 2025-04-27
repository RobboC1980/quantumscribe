import { supabaseAdmin } from '../lib/createSupabaseAdmin';
import { validateEmail, validatePassword } from '../utils/validators';
import { UserRole } from '../types/auth';

export async function register(email: string, password: string, role: UserRole = 'reader') {
  // Validate input
  if (!email || !password) {
    throw new Error('Email and password required');
  }
  
  if (!validateEmail(email)) {
    throw new Error('Invalid email format');
  }
  
  if (!validatePassword(password)) {
    throw new Error('Password must be at least 6 characters');
  }

  // Sign up via Supabase Auth
  const { data, error } = await supabaseAdmin.auth.signUp({
    email,
    password,
    options: {
      data: {
        role: role,
      }
    }
  });

  if (error) {
    // Supabase returns 400 for invalid/email-in-use, 429 rate-limits, etc.
    throw new Error(error.message);
  }

  if (!data.user) {
    throw new Error('Failed to create user');
  }

  // Create user record in the users table with the role
  const { error: userError } = await supabaseAdmin
    .from('users')
    .insert({
      id: data.user.id,
      email: data.user.email,
      role: role,
      created_at: new Date().toISOString()
    });

  if (userError) {
    // If creating the user record fails, we should delete the auth user
    await supabaseAdmin.auth.admin.deleteUser(data.user.id);
    throw new Error(`Failed to create user profile: ${userError.message}`);
  }

  // Return user data
  return {
    user: {
      id: data.user.id,
      email: data.user.email,
      role: role,
    },
  };
}

export async function login(email: string, password: string) {
  // Validate input
  if (!email || !password) {
    throw new Error('Email and password required');
  }

  if (!validateEmail(email)) {
    throw new Error('Invalid email format');
  }

  // Sign in via Supabase Auth
  const { data, error } = await supabaseAdmin.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    // Map Supabase errors to appropriate error messages
    if (error.message.includes('Invalid login credentials')) {
      throw Object.assign(new Error('Invalid credentials'), { status: 401 });
    }
    
    if (error.message.includes('rate limit')) {
      throw Object.assign(new Error('Too many login attempts. Please try again later.'), { status: 429 });
    }

    // Generic error for other cases
    throw Object.assign(new Error(error.message), { status: error.status || 400 });
  }

  // Get the user's role from the database
  const { data: userData, error: userError } = await supabaseAdmin
    .from('users')
    .select('role')
    .eq('id', data.user.id)
    .single();

  if (userError) {
    throw Object.assign(new Error('Failed to fetch user data'), { status: 500 });
  }

  // Return user data and session
  return {
    session: data.session,
    user: {
      id: data.user.id,
      email: data.user.email,
      role: userData.role as UserRole,
    },
  };
}

export async function refreshSession(refreshToken: string) {
  const { data, error } = await supabaseAdmin.auth.refreshSession({ 
    refresh_token: refreshToken 
  });
  
  if (error) {
    throw new Error('Failed to refresh session');
  }
  
  if (!data.user || !data.session) {
    throw new Error('No session to refresh');
  }
  
  // Get the user's role from the database
  const { data: userData, error: userError } = await supabaseAdmin
    .from('users')
    .select('role')
    .eq('id', data.user.id)
    .single();

  if (userError) {
    throw new Error('Failed to fetch user data');
  }
  
  return {
    session: data.session,
    user: {
      id: data.user.id,
      email: data.user.email || '',
      role: userData.role as UserRole,
    }
  };
}

export async function signOut(sessionId: string) {
  const { error } = await supabaseAdmin.auth.admin.signOut(sessionId);
  
  if (error) {
    throw new Error('Failed to sign out');
  }
  
  return { success: true };
}

export async function resetPasswordForEmail(email: string) {
  if (!email) {
    throw new Error('Email is required');
  }
  
  if (!validateEmail(email)) {
    throw new Error('Invalid email format');
  }
  
  const { error } = await supabaseAdmin.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.FRONTEND_URL}/reset-password`,
  });
  
  if (error) {
    throw new Error(error.message);
  }
  
  return { success: true };
}

export async function updateUserPassword(userId: string, password: string) {
  if (!password) {
    throw new Error('Password is required');
  }
  
  if (!validatePassword(password)) {
    throw new Error('Password must be at least 6 characters');
  }
  
  const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    password: password,
  });
  
  if (error) {
    throw new Error(error.message);
  }
  
  return { success: true };
}

export async function updateUserRole(userId: string, role: UserRole) {
  // Update the role in Supabase auth user metadata
  const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    user_metadata: { role }
  });
  
  if (authError) {
    throw new Error(`Failed to update auth user role: ${authError.message}`);
  }
  
  // Update the role in the users table
  const { error: dbError } = await supabaseAdmin
    .from('users')
    .update({ role, updated_at: new Date().toISOString() })
    .eq('id', userId);
  
  if (dbError) {
    throw new Error(`Failed to update user role in database: ${dbError.message}`);
  }
  
  return { success: true };
} 
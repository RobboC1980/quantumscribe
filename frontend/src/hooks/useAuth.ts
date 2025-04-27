import { useState, useEffect, createContext, useContext } from 'react';
import { UserRole } from '../types/auth';

// Define user and auth context types
interface User {
  id: string;
  email: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkPermission: (allowedRoles: UserRole[]) => boolean;
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  checkPermission: () => false,
});

// API URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Check for existing session on load
  useEffect(() => {
    const initAuth = async () => {
      try {
        setLoading(true);
        const token = sessionStorage.getItem('access_token');
        
        if (!token) {
          setLoading(false);
          return;
        }

        // Validate token and get user info
        const response = await fetch(`${API_URL}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        } else {
          // Token invalid or expired
          sessionStorage.removeItem('access_token');
          sessionStorage.removeItem('refresh_token');
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Store tokens
      sessionStorage.setItem('access_token', data.session.access_token);
      sessionStorage.setItem('refresh_token', data.session.refresh_token);
      
      // Set user data
      setUser(data.user);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      // Automatically login after successful registration
      await login(email, password);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      
      // Call logout endpoint if you have one
      const token = sessionStorage.getItem('access_token');
      if (token) {
        await fetch(`${API_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            session_id: sessionStorage.getItem('session_id')
          })
        });
      }
      
      // Clear tokens and user
      sessionStorage.removeItem('access_token');
      sessionStorage.removeItem('refresh_token');
      sessionStorage.removeItem('session_id');
      setUser(null);
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to check if user has permission based on role
  const checkPermission = (allowedRoles: UserRole[]): boolean => {
    return !!user && allowedRoles.includes(user.role);
  };

  const contextValue: AuthContextType = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    checkPermission,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext); 
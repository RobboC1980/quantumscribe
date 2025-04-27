export type UserRole = 'admin' | 'editor' | 'reader';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface Session {
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

export interface AuthResponse {
  user: User;
  session: Session;
}

export interface AuthError {
  message: string;
  status: number;
} 
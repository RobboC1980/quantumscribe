import request from 'supertest';
import app from '../src/app';
import { supabaseAdmin } from '../src/lib/createSupabaseAdmin';

// Mock Supabase Auth methods
jest.mock('../src/lib/createSupabaseAdmin', () => ({
  supabaseAdmin: {
    auth: {
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      admin: {
        signOut: jest.fn(),
        updateUserById: jest.fn(),
      },
      resetPasswordForEmail: jest.fn(),
    },
  },
}));

describe('Auth Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/login', () => {
    it('should return 200 and tokens for valid credentials', async () => {
      // Mock successful login
      const mockUser = { id: 'user123', email: 'test@example.com' };
      const mockSession = {
        access_token: 'valid-access-token',
        refresh_token: 'valid-refresh-token',
        expires_at: Date.now() + 3600 * 1000,
      };

      (supabaseAdmin.auth.signInWithPassword as jest.Mock).mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'password123' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('session');
      expect(response.body.user).toEqual(mockUser);
      expect(response.body.session).toHaveProperty('access_token');
      expect(response.body.session).toHaveProperty('refresh_token');
    });

    it('should return 401 for invalid credentials', async () => {
      // Mock failed login due to invalid credentials
      (supabaseAdmin.auth.signInWithPassword as jest.Mock).mockResolvedValue({
        data: { user: null, session: null },
        error: {
          message: 'Invalid login credentials',
          status: 401,
        },
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'wrongpassword' });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Invalid credentials');
    });

    it('should return 429 for rate-limited login attempts', async () => {
      // Mock rate limit error
      (supabaseAdmin.auth.signInWithPassword as jest.Mock).mockResolvedValue({
        data: { user: null, session: null },
        error: {
          message: 'Too many requests. Try again in 60 seconds. rate limit exceeded',
          status: 429,
        },
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'password123' });

      expect(response.status).toBe(429);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('too many login attempts');
    });

    it('should return 400 for missing fields', async () => {
      const response = await request(app).post('/api/auth/login').send({});
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  // Additional test for the register endpoint
  describe('POST /api/auth/register', () => {
    it('should return 201 for successful registration', async () => {
      // Mock successful registration
      const mockUser = { id: 'newuser123', email: 'newuser@example.com' };
      
      (supabaseAdmin.auth.signUp as jest.Mock).mockResolvedValue({
        data: { user: mockUser, session: null },
        error: null,
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send({ email: 'newuser@example.com', password: 'password123' });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe('newuser@example.com');
    });

    it('should return 409 if user already exists', async () => {
      // Mock error for existing user
      (supabaseAdmin.auth.signUp as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: { message: 'User with this email already exists', status: 409 },
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send({ email: 'existing@example.com', password: 'password123' });

      expect(response.status).toBe(409);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('already exists');
    });
  });

  // Test for password reset flow
  describe('POST /api/auth/forgot-password', () => {
    it('should return 200 for successful password reset request', async () => {
      // Mock successful password reset email
      (supabaseAdmin.auth.resetPasswordForEmail as jest.Mock).mockResolvedValue({
        data: {},
        error: null,
      });

      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'user@example.com' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message');
    });
  });
}); 
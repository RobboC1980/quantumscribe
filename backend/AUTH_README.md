# Authentication Implementation

This project uses Supabase Auth for secure, scalable authentication. The implementation replaces manual bcrypt/JWT/Prisma logic with the Supabase client, and extracts CORS, method-checking and validation into reusable middleware.

## Environment Setup

Make sure you've set these in your `.env` (or project settings):

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi…  
SUPABASE_ANON_KEY=eyJhbGciOi…
FRONTEND_URL=https://app.yourdomain.com
```

## Key Components

### 1. Middleware (middleware/auth.ts)

- **CORS**: Very restrictive CORS settings locked to FRONTEND_URL
- **Method Guards**: Prevent unsupported HTTP methods, proper handling of OPTIONS requests

### 2. Validators (utils/validators.ts)

- Simple RFC-compliant email validation
- Password strength validation

### 3. Auth Routes (routes/auth.ts)

- Registration endpoint with proper validation
- Login with Supabase Auth
- Session refresh and management
- Signout functionality
- Password reset flow

### 4. Auth Service (services/auth.service.ts)

- Uses Supabase client for authentication operations
- Handles signup, login, session refresh, and signout
- Provides password reset functionality

## API Endpoints

### Registration

```bash
curl -X POST https://your-api.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "securepassword"}'
```

Response (201 Created):
```json
{
  "user": {
    "id": "user-uuid",
    "email": "user@example.com"
  }
}
```

### Login

```bash
curl -X POST https://your-api.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "securepassword"}'
```

Response (200 OK):
```json
{
  "user": {
    "id": "user-uuid",
    "email": "user@example.com"
  },
  "session": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_at": 1684239850
  }
}
```

### Password Reset Request

```bash
curl -X POST https://your-api.com/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com"}'
```

Response (200 OK):
```json
{
  "success": true,
  "message": "Password reset email sent"
}
```

## Front-end Integration

### User Authentication Flow

1. **Sign-up Form**:
   - Collect email and password
   - Submit to `/api/auth/register` endpoint
   - Handle success/error responses

2. **Login Form**:
   - Collect email and password
   - Submit to `/api/auth/login` endpoint
   - Store the returned tokens securely

3. **Token Storage**:
   - Store access token in memory for API calls
   - Store refresh token in an HTTP-only cookie or secure storage
   - Use access token for Authorization header in API requests

4. **Session Management**:
   - Check token expiration before API calls
   - Use refresh token to obtain new access token when needed
   - Clear tokens on logout

### Example React Hook

```jsx
// useAuth.js
import { useState, useEffect, createContext, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on load
    checkSession();
  }, []);

  const checkSession = async () => {
    // Implementation to check for existing valid session
  };

  const login = async (email, password) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }
      
      const data = await response.json();
      setUser(data.user);
      
      // Store tokens
      sessionStorage.setItem('access_token', data.session.access_token);
      
      return data;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    // Implement logout logic
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
```

## Testing

Our authentication endpoints are covered by automated tests (see `tests/auth.test.ts`):

- Valid registration creates a new user (201)
- Duplicate email registrations are rejected (409)
- Valid login returns tokens (200)
- Invalid credentials are properly rejected (401)
- Rate limiting is enforced for security (429)

Run the tests with:

```bash
npm test -- --testPathPattern=auth
```

## Benefits

- **Zero bcrypt/JWT**: Supabase handles hashing, token issuance and expiry
- **Scoped CORS**: Locked to FRONTEND_URL to prevent credential leakage
- **Modularity**: Middleware and validators are reusable across all endpoints
- **Error mapping**: Bubbles Supabase's error codes/messages back to the client

## HTTP 405 Method Not Allowed Protection

The middleware automatically rejects requests with unsupported methods, preventing common attack vectors and ensuring only intended access patterns are supported. 
# QuantumScribe: Role-Based Access Control Implementation

This project implements a comprehensive Role-Based Access Control (RBAC) system with Row-Level Security (RLS) in a React/TypeScript frontend and Express/Supabase backend.

## Features

- **User Roles**: Admin, Editor, and Reader roles with different permissions
- **Protected Routes**: Role-based frontend route protection
- **Row-Level Security**: Database-level security for data access control
- **Role Management**: Admin UI for managing user roles
- **Project Management**: Create, view, edit, and delete projects based on permissions

## Getting Started

### Prerequisites

- Node.js 16+
- pnpm (or npm/yarn)
- Supabase account and local development setup

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   pnpm install
   ```
3. Set up environment variables in both frontend and backend:
   ```
   # Backend .env
   SUPABASE_URL=your-supabase-url
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   FRONTEND_URL=http://localhost:5173
   
   # Frontend .env
   VITE_API_URL=http://localhost:4000/api
   ```

4. Run the Supabase migrations:
   ```
   cd supabase
   supabase db reset
   ```

5. Start the backend:
   ```
   cd backend
   pnpm dev
   ```

6. Start the frontend:
   ```
   cd frontend
   pnpm dev
   ```

## Testing Authentication Flows

### 1. Register a New User

1. Visit http://localhost:5173/register
2. Create a new account with:
   - Email: admin@example.com
   - Password: password123
3. Upon successful registration, you'll be redirected to the dashboard

### 2. Update User Role to Admin

Since the first user needs admin privileges to manage other users:

1. Connect to your Supabase database
2. Run the following SQL:
   ```sql
   UPDATE public.users 
   SET role = 'admin' 
   WHERE email = 'admin@example.com';
   ```

### 3. Test Login Flow

1. Log out from the dashboard
2. Visit http://localhost:5173/login
3. Log in with your admin credentials
4. Verify you can access the admin panel

### 4. Create More Users with Different Roles

1. Register a second user: editor@example.com
2. Register a third user: reader@example.com
3. Go to the Admin Panel as admin
4. Set the appropriate roles for each user

### 5. Test Role-Based Access

1. Log in as the reader user
2. Try to access /admin - you should be redirected to the forbidden page
3. Try to edit a project - the edit button should not be visible
4. Log in as the editor user
5. Verify you can edit projects but not access the admin panel
6. Log in as the admin user
7. Verify you have full access to all features

## Project Structure

```
├── backend/
│   ├── src/
│   │   ├── middleware/  # Auth and role middleware
│   │   ├── routes/      # API endpoints
│   │   ├── services/    # Business logic
│   │   └── types/       # TypeScript interfaces
└── frontend/
    ├── src/
    │   ├── components/  # Reusable components
    │   ├── hooks/       # Custom hooks including auth
    │   ├── pages/       # UI pages
    │   └── types/       # TypeScript interfaces
    └── styles.css       # Global styles
```

## Security Features

- **Defense in Depth**: Security checks at both API and database levels
- **JWT Authentication**: Secure token-based auth flow
- **Least Privilege**: Users only have access to what they need
- **Row-Level Security**: Database-enforced access control
- **Protected Routes**: Frontend prevents unauthorized access attempts 
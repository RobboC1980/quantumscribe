# Role-Based Access Control (RBAC) & Row-Level Security (RLS)

This document explains the implementation of role-based access control and row-level security in the QuantumScribe application.

## User Roles

The system defines three distinct user roles:

1. **Admin** - Full system access, can manage users and all content
2. **Editor** - Can create and edit content they have access to
3. **Reader** - Read-only access to content they have access to

## Database Schema with RLS

### Tables

- **users** - User accounts with roles
- **projects** - Projects owned by users
- **project_members** - Junction table for project membership

### Row-Level Security Policies

RLS policies are enforced directly at the database level for maximum security:

#### Users Table

| Policy Name | Description | Effect |
|-------------|-------------|--------|
| users_read_own | Users can read their own data | Users can only see their own profile |
| users_read_all_admin | Admins can read all user data | Admins can see all user profiles |
| users_update_own | Users can update their own data (except role) | Users can modify their profile but not change role |
| users_update_admin | Admins can update any user | Admins can modify any user profile including roles |
| users_delete_admin | Only admins can delete users | Only admins can delete user accounts |

#### Projects Table

| Policy Name | Description | Effect |
|-------------|-------------|--------|
| projects_read_own | Owners can read their projects | Project owners can see their projects |
| projects_read_member | Members can read their projects | Project members can see projects they belong to |
| projects_read_public | Public projects are visible to all | Anyone can see projects marked as public |
| projects_update_own | Owners can update their projects | Project owners can modify their projects |
| projects_update_editor | Editors can update assigned projects | Editors can modify projects they have editor access to |
| projects_delete_own | Only owners can delete their projects | Project deletion restricted to owners |
| projects_admin_all | Admins have full access | Admins can see and modify all projects |

## Implementation

### 1. Backend Middleware

Authentication and authorization are enforced through middleware:

```typescript
// Middleware to verify JWT and extract user info
export async function requireAuth(req, res, next) {
  // ... token verification logic
  // Attach user to request
  req.user = { id, email, role };
  next();
}

// Role-based authorization middleware
export function requireRole(allowedRoles) {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
}
```

### 2. Frontend Route Protection

Routes are protected on the frontend using React Router guards:

```jsx
function ProtectedRoute({ requiredRoles, children }) {
  const { user, loading } = useAuth();
  
  if (loading) return <LoadingSpinner />;
  
  if (!user || !requiredRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}

// Usage
<Route
  path="/admin/*"
  element={
    <ProtectedRoute requiredRoles={['admin']}>
      <AdminPanel />
    </ProtectedRoute>
  }
/>
```

### 3. Database Row-Level Security

RLS is configured directly in Supabase:

```sql
-- Example: Only project owners and admins can update projects
CREATE POLICY projects_update_own ON projects
  FOR UPDATE
  USING (auth.uid() = owner_id);

-- Function to get all projects a user can access
CREATE FUNCTION get_accessible_projects(user_uuid UUID)
RETURNS SETOF projects AS $$
  -- Implementation details
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Testing RBAC/RLS

To test the RBAC/RLS implementation:

1. Create users with different roles (admin, editor, reader)
2. Create projects owned by different users
3. Add members to projects with different roles
4. Verify that:
   - Admins can see and modify everything
   - Editors can see all projects they're a member of and edit those where they have editor role
   - Readers can only view content, not modify it
   - Users can't see projects they don't have access to

## Security Considerations

- JWT tokens are verified on every request
- Role checks are performed both in middleware and at the database level (defense in depth)
- RLS policies enforce access control even if API endpoints are bypassed
- Function-level security with `SECURITY DEFINER` ensures consistent application of rules

## Compliance Impact

This RBAC/RLS implementation helps satisfy requirements for:

- **GDPR** - Data access is strictly controlled
- **SOC2** - Access control and audit mechanisms are in place
- **HIPAA** - Data segregation and access limitations support PHI protection 
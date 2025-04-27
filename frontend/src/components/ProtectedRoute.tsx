import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../types/auth';
import LoadingSpinner from './LoadingSpinner';

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
  redirectTo?: string;
  children?: React.ReactNode;
}

/**
 * A route component that checks if the user is authenticated and has the required role
 * before rendering its children or the outlet.
 */
const ProtectedRoute = ({ 
  allowedRoles = [], 
  redirectTo = '/login',
  children 
}: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Show loading state while checking authentication
  if (loading) {
    return <LoadingSpinner />;
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // If roles are specified, check if user has required role
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Redirect to a forbidden page or dashboard
    return <Navigate to="/forbidden" replace />;
  }

  // Render children or outlet if authenticated and authorized
  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute; 
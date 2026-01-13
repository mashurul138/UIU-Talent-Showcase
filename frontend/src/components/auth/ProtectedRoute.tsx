import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole, hasAnyRole, hasMinimumRole } from '../../utils/permissions';

interface ProtectedRouteProps {
  children: ReactNode;
  roles?: UserRole[];
  minimumRole?: UserRole;
  redirectTo?: string;
}

export function ProtectedRoute({ 
  children, 
  roles, 
  minimumRole,
  redirectTo = '/login' 
}: ProtectedRouteProps) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return <Navigate to={redirectTo} replace />;
  }

  if (roles && !hasAnyRole(user, roles)) {
    return <Navigate to="/" replace />;
  }

  if (minimumRole && !hasMinimumRole(user, minimumRole)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

interface PublicRouteProps {
  children: ReactNode;
  redirectTo?: string;
}

export function PublicRoute({ children, redirectTo = '/' }: PublicRouteProps) {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
}

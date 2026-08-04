import type { ReactElement } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores';
import { tokenStorage } from '@/utils/token-storage';
import { hasPermission } from '@/utils/permission';

interface ProtectedRouteProps {
  children: ReactElement;
  requireAdmin?: boolean;
  requiredPermissions?: string[];
}

export default function ProtectedRoute({ children, requireAdmin = false, requiredPermissions = [] }: ProtectedRouteProps) {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated || !tokenStorage.getAccessToken()) return <Navigate to="/login" replace />;
  if (requireAdmin && user?.username !== 'admin') return <Navigate to="/" replace />;
  if (requiredPermissions.length > 0 && !requiredPermissions.some((permission) => hasPermission(user, permission))) {
    return <Navigate to="/" replace />;
  }
  return children;
}

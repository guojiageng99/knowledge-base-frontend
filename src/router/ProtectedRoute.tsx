import type { ReactElement } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores';
import { tokenStorage } from '@/utils/token-storage';

interface ProtectedRouteProps {
  children: ReactElement;
  requireAdmin?: boolean;
}

export default function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated || !tokenStorage.getAccessToken()) return <Navigate to="/login" replace />;
  if (requireAdmin && user?.username !== 'admin') return <Navigate to="/" replace />;
  return children;
}

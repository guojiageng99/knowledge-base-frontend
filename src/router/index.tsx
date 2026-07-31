import { Suspense, lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

const LoginPage = lazy(() => import('@/pages/LoginPage'));
const DashboardPage = lazy(() => import('@/pages/DashboardPage'));

const loading = <div style={{ padding: 24 }}>加载中...</div>;

export const router = createBrowserRouter([
  { path: '/login', element: <Suspense fallback={loading}><LoginPage /></Suspense> },
  {
    path: '/',
    element: <ProtectedRoute><Suspense fallback={loading}><DashboardPage /></Suspense></ProtectedRoute>,
  },
  { path: '*', element: <Navigate to="/" replace /> },
]);

import { Suspense, lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

const LoginPage = lazy(() => import('@/pages/LoginPage'));
const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const DocumentsPage = lazy(() => import('@/pages/DocumentsPage'));
const DocumentEditorPage = lazy(() => import('@/pages/DocumentEditorPage'));
const DocumentDetailPage = lazy(() => import('@/pages/DocumentDetailPage'));
const CategoriesPage = lazy(() => import('@/pages/CategoriesPage'));
const UsersPage = lazy(() => import('@/pages/UsersPage'));
const ImportDocumentPage = lazy(() => import('@/pages/ImportDocumentPage'));
const DraftsPage = lazy(() => import('@/pages/DraftsPage'));

const loading = <div style={{ padding: 24 }}>加载中...</div>;

export const router = createBrowserRouter([
  { path: '/login', element: <Suspense fallback={loading}><LoginPage /></Suspense> },
  {
    path: '/',
    element: <ProtectedRoute><Suspense fallback={loading}><DashboardPage /></Suspense></ProtectedRoute>,
  },
  {
    path: '/documents',
    element: <ProtectedRoute><Suspense fallback={loading}><DocumentsPage /></Suspense></ProtectedRoute>,
  },
  {
    path: '/documents/create',
    element: <ProtectedRoute><Suspense fallback={loading}><DocumentEditorPage /></Suspense></ProtectedRoute>,
  },
  {
    path: '/documents/import',
    element: <ProtectedRoute><Suspense fallback={loading}><ImportDocumentPage /></Suspense></ProtectedRoute>,
  },
  {
    path: '/documents/:id',
    element: <ProtectedRoute><Suspense fallback={loading}><DocumentDetailPage /></Suspense></ProtectedRoute>,
  },
  {
    path: '/documents/:id/edit',
    element: <ProtectedRoute><Suspense fallback={loading}><DocumentEditorPage /></Suspense></ProtectedRoute>,
  },
  {
    path: '/categories',
    element: <ProtectedRoute><Suspense fallback={loading}><CategoriesPage /></Suspense></ProtectedRoute>,
  },
  {
    path: '/users',
    element: <ProtectedRoute><Suspense fallback={loading}><UsersPage /></Suspense></ProtectedRoute>,
  },
  {
    path: '/drafts',
    element: <ProtectedRoute><Suspense fallback={loading}><DraftsPage /></Suspense></ProtectedRoute>,
  },
  { path: '*', element: <Navigate to="/" replace /> },
]);

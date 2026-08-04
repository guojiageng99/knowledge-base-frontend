import { Suspense, lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import { PERMISSIONS } from '@/utils/permission';

const LoginPage = lazy(() => import('@/pages/LoginPage'));
const ActivateAccountPage = lazy(() => import('@/pages/ActivateAccountPage'));
const ForgotPasswordPage = lazy(() => import('@/pages/ForgotPasswordPage'));
const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const DocumentsPage = lazy(() => import('@/pages/DocumentsPage'));
const DocumentEditorPage = lazy(() => import('@/pages/DocumentEditorPage'));
const AutoSaveHistoryPage = lazy(() => import('@/pages/AutoSaveHistoryPage'));
const DocumentDetailPage = lazy(() => import('@/pages/DocumentDetailPage'));
const CategoriesPage = lazy(() => import('@/pages/CategoriesPage'));
const UsersPage = lazy(() => import('@/pages/UsersPage'));
const ImportDocumentPage = lazy(() => import('@/pages/ImportDocumentPage'));
const DraftsPage = lazy(() => import('@/pages/DraftsPage'));
const FavoritesPage = lazy(() => import('@/pages/FavoritesPage'));
const RecentAccessPage = lazy(() => import('@/pages/RecentAccessPage'));
const ShareViewerPage = lazy(() => import('@/pages/ShareViewerPage'));
const AIAssistantPage = lazy(() => import('@/pages/AIAssistantPage'));
const KnowledgeGraphPage = lazy(() => import('@/pages/KnowledgeGraphPage'));
const SearchPage = lazy(() => import('@/pages/SearchPage'));
const FileManagementPage = lazy(() => import('@/pages/FileManagementPage'));
const TeamsPage = lazy(() => import('@/pages/TeamsPage'));
const ExportDataPage = lazy(() => import('@/pages/ExportDataPage'));
const ProfilePage = lazy(() => import('@/pages/ProfilePage'));
const StatisticsPage = lazy(() => import('@/pages/StatisticsPage'));
const ReviewPage = lazy(() => import('@/pages/ReviewPage'));
const AIWritingPage = lazy(() => import('@/pages/AIWritingPage'));
const NotificationCenterPage = lazy(() => import('@/pages/NotificationCenterPage'));
const DocumentReviewWorkspacePage = lazy(() => import('@/pages/DocumentReviewWorkspacePage'));
const PermissionsPage = lazy(() => import('@/pages/PermissionsPage'));
const SettingsPage = lazy(() => import('@/pages/SettingsPage'));

const loading = <div style={{ padding: 24 }}>加载中...</div>;

export const router = createBrowserRouter([
  { path: '/login', element: <Suspense fallback={loading}><LoginPage /></Suspense> },
  { path: '/activate', element: <Suspense fallback={loading}><ActivateAccountPage /></Suspense> },
  { path: '/forgot-password', element: <Suspense fallback={loading}><ForgotPasswordPage /></Suspense> },
  { path: '/share/:shareId', element: <Suspense fallback={loading}><ShareViewerPage /></Suspense> },
  { path: '/ai', element: <ProtectedRoute><Suspense fallback={loading}><AIAssistantPage /></Suspense></ProtectedRoute> },
  { path: '/ai-writing', element: <ProtectedRoute><Suspense fallback={loading}><AIWritingPage /></Suspense></ProtectedRoute> },
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
    path: '/documents/export',
    element: <ProtectedRoute><Suspense fallback={loading}><ExportDataPage /></Suspense></ProtectedRoute>,
  },
  {
    path: '/documents/:id',
    element: <ProtectedRoute><Suspense fallback={loading}><DocumentDetailPage /></Suspense></ProtectedRoute>,
  },
  {
    path: '/documents/:id/edit',
    element: <ProtectedRoute><Suspense fallback={loading}><DocumentEditorPage /></Suspense></ProtectedRoute>,
  },
  { path: '/documents/:id/autosave-history', element: <ProtectedRoute><Suspense fallback={loading}><AutoSaveHistoryPage /></Suspense></ProtectedRoute> },
  {
    path: '/categories',
    element: <ProtectedRoute><Suspense fallback={loading}><CategoriesPage /></Suspense></ProtectedRoute>,
  },
  {
    path: '/users',
    element: <ProtectedRoute><Suspense fallback={loading}><UsersPage /></Suspense></ProtectedRoute>,
  },
  {
    path: '/profile',
    element: <ProtectedRoute><Suspense fallback={loading}><ProfilePage /></Suspense></ProtectedRoute>,
  },
  {
    path: '/admin/statistics',
    element: <ProtectedRoute><Suspense fallback={loading}><StatisticsPage /></Suspense></ProtectedRoute>,
  },
  { path: '/admin/reviews', element: <ProtectedRoute><Suspense fallback={loading}><ReviewPage /></Suspense></ProtectedRoute> },
  { path: '/notifications', element: <ProtectedRoute><Suspense fallback={loading}><NotificationCenterPage /></Suspense></ProtectedRoute> },
  { path: '/review/documents/:documentId', element: <ProtectedRoute requireAdmin><Suspense fallback={loading}><DocumentReviewWorkspacePage /></Suspense></ProtectedRoute> },
  {
    path: '/drafts',
    element: <ProtectedRoute><Suspense fallback={loading}><DraftsPage /></Suspense></ProtectedRoute>,
  },
  {
    path: '/favorites',
    element: <ProtectedRoute><Suspense fallback={loading}><FavoritesPage /></Suspense></ProtectedRoute>,
  },
  {
    path: '/recent-access',
    element: <ProtectedRoute><Suspense fallback={loading}><RecentAccessPage /></Suspense></ProtectedRoute>,
  },
  { path: '/knowledge-graph', element: <ProtectedRoute><Suspense fallback={loading}><KnowledgeGraphPage /></Suspense></ProtectedRoute> },
  { path: '/search', element: <ProtectedRoute><Suspense fallback={loading}><SearchPage /></Suspense></ProtectedRoute> },
  { path: '/files', element: <ProtectedRoute><Suspense fallback={loading}><FileManagementPage /></Suspense></ProtectedRoute> },
  { path: '/admin/teams', element: <ProtectedRoute><Suspense fallback={loading}><TeamsPage /></Suspense></ProtectedRoute> },
  { path: '/admin/permissions', element: <ProtectedRoute requireAdmin requiredPermissions={[PERMISSIONS.systemPermission]}><Suspense fallback={loading}><PermissionsPage /></Suspense></ProtectedRoute> },
  { path: '/admin/settings', element: <ProtectedRoute requireAdmin requiredPermissions={[PERMISSIONS.systemSettings]}><Suspense fallback={loading}><SettingsPage /></Suspense></ProtectedRoute> },
  { path: '*', element: <Navigate to="/" replace /> },
]);

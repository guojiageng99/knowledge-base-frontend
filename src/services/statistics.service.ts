import dayjs from 'dayjs';
import http, { download } from './request';
import type { ActiveUserItem, CategoryDistributionItem, DashboardData, HotDocumentItem, StatisticsOverview, TrendDataPoint, UserActivityItem } from '@/types';

export const statisticsService = {
  getOverview: (params?: { startDate?: string; endDate?: string }): Promise<StatisticsOverview> => http.get('/statistics/overview', { params }),
  getDashboard: (): Promise<DashboardData> => http.get('/statistics/dashboard'),
  getAdminOverview: (): Promise<StatisticsOverview> => http.get('/statistics/admin-overview'),
  getDocumentTrend: (params: { startDate: string; endDate: string; trendType?: 'create' | 'view' }): Promise<TrendDataPoint[]> => http.get('/statistics/trend/document', { params: { startDate: params.startDate, endDate: params.endDate, type: params.trendType ?? 'create' } }),
  getUserActivity: (params: { startDate: string; endDate: string }): Promise<UserActivityItem[]> => http.get('/statistics/activity/user', { params }),
  getCategoryDistribution: (): Promise<CategoryDistributionItem[]> => http.get('/statistics/distribution/category'),
  getHotDocuments: (params: { type?: 'view' | 'like' | 'favorite'; size?: number }): Promise<HotDocumentItem[]> => http.get('/statistics/hot/document', { params: { type: params.type ?? 'view', size: params.size ?? 10 } }),
  getActiveUsers: (params: { type?: 'create' | 'comment' | 'view'; size?: number }): Promise<ActiveUserItem[]> => http.get('/statistics/active/user', { params: { type: params.type ?? 'create', size: params.size ?? 10 } }),
  exportTrendCSV: (params: { startDate: string; endDate: string; type?: 'create' | 'view' }): Promise<void> => download(`/statistics/export/trend?startDate=${params.startDate}&endDate=${params.endDate}&type=${params.type ?? 'create'}`),
  exportHotDocumentsCSV: (params: { type?: 'view' | 'like' | 'favorite'; size?: number }): Promise<void> => download(`/statistics/export/hot-documents?type=${params.type ?? 'view'}&size=${params.size ?? 20}`),
  exportActiveUsersCSV: (params: { type?: 'create' | 'comment' | 'view'; size?: number }): Promise<void> => download(`/statistics/export/active-users?type=${params.type ?? 'create'}&size=${params.size ?? 20}`),
  clearCache: (): Promise<string> => http.delete('/statistics/cache'),
  triggerDocumentAggregation: (): Promise<string> => http.post('/statistics/aggregation/document'),
  triggerUserAggregation: (): Promise<string> => http.post('/statistics/aggregation/user'),
};

export const getDateRange = (period: 'week' | 'month' | 'year') => {
  const endDate = dayjs().format('YYYY-MM-DD');
  const days = { week: 6, month: 29, year: 364 }[period];
  return { startDate: dayjs().subtract(days, 'day').format('YYYY-MM-DD'), endDate };
};

export default statisticsService;

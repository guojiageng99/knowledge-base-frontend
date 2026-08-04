import http from './request';
import type { SystemNotification } from '@/types';

interface NotificationPage {
  records: SystemNotification[];
  total: number;
  current: number;
  size: number;
}

export const notificationService = {
  getNotifications: (params?: { current?: number; size?: number; notificationType?: string; isRead?: number }) =>
    http.get<NotificationPage>('/notifications', { params }) as unknown as Promise<NotificationPage>,
  getUnreadCount: () => http.get<number>('/notifications/unread-count') as unknown as Promise<number>,
  getNotification: (id: string) => http.get<SystemNotification>(`/notifications/${id}`) as unknown as Promise<SystemNotification>,
  markAsRead: (id: string) => http.put(`/notifications/${id}/read`),
  markAllAsRead: () => http.put('/notifications/read-all'),
  deleteNotification: (id: string) => http.delete(`/notifications/${id}`),
  clearAll: () => http.delete('/notifications/clear-all'),
};

export default notificationService;

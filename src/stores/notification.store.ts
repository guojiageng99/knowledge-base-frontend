import { create } from 'zustand';
import { notificationService } from '@/services/notification.service';
import type { SystemNotification, WsNotificationPayload } from '@/types';

interface NotificationState {
  notifications: SystemNotification[];
  unreadCount: number;
  isLoading: boolean;
  fetchNotifications: (params?: { current?: number; size?: number; notificationType?: string; isRead?: number }) => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  clearAll: () => Promise<void>;
  addNotification: (payload: WsNotificationPayload) => void;
  reset: () => void;
}

const mapNotification = (raw: Partial<SystemNotification> & Record<string, unknown>): SystemNotification => ({
  id: String(raw.id ?? Date.now()),
  type: (raw.notificationType ?? raw.type ?? 'system') as SystemNotification['type'],
  title: String(raw.title ?? ''),
  content: String(raw.content ?? ''),
  link: raw.link as string | undefined,
  relatedType: raw.relatedType as string | undefined,
  relatedId: raw.relatedId as number | undefined,
  read: Boolean(raw.isRead ?? raw.read ?? false),
  createdAt: String(raw.createdAt ?? raw.createTime ?? new Date().toISOString()),
});

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [], unreadCount: 0, isLoading: false,
  fetchNotifications: async (params) => {
    set({ isLoading: true });
    try {
      const page = await notificationService.getNotifications(params);
      const notifications = ((page.records ?? []) as unknown as Array<Partial<SystemNotification> & Record<string, unknown>>).map(mapNotification);
      set({ notifications, isLoading: false });
    } finally {
      set({ isLoading: false });
    }
  },
  fetchUnreadCount: async () => set({ unreadCount: await notificationService.getUnreadCount() }),
  markAsRead: async (id) => {
    await notificationService.markAsRead(id);
    set((state) => ({ notifications: state.notifications.map((item) => item.id === id ? { ...item, read: true } : item), unreadCount: Math.max(0, state.unreadCount - (state.notifications.find((item) => item.id === id)?.read ? 0 : 1)) }));
  },
  markAllAsRead: async () => {
    await notificationService.markAllAsRead();
    set((state) => ({ notifications: state.notifications.map((item) => ({ ...item, read: true })), unreadCount: 0 }));
  },
  deleteNotification: async (id) => {
    await notificationService.deleteNotification(id);
    set((state) => ({ notifications: state.notifications.filter((item) => item.id !== id), unreadCount: state.notifications.find((item) => item.id === id)?.read ? state.unreadCount : Math.max(0, state.unreadCount - 1) }));
  },
  clearAll: async () => {
    await notificationService.clearAll();
    set({ notifications: [], unreadCount: 0 });
  },
  addNotification: (payload) => set((state) => ({ notifications: [mapNotification(payload as unknown as Record<string, unknown>), ...state.notifications], unreadCount: state.unreadCount + 1 })),
  reset: () => set({ notifications: [], unreadCount: 0 }),
}));

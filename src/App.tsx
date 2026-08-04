import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { useEffect } from 'react';
import { useAuthStore, useNotificationStore } from '@/stores';
import { webSocketService } from '@/services';
import type { WsNotificationPayload } from '@/types';

export default function App() {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const reset = useNotificationStore((state) => state.reset);
  const fetchUnreadCount = useNotificationStore((state) => state.fetchUnreadCount);
  useEffect(() => {
    if (!token) { webSocketService.disconnect(); reset(); return; }
    void fetchUnreadCount();
    const isReviewer = user?.username === 'admin'
      || (user?.roles?.some((role) => role === 'REVIEWER' || role === 'ROLE_REVIEWER') ?? false);
    const addNotification = (payload: WsNotificationPayload) => useNotificationStore.getState().addNotification(payload);
    const unsubscribe = webSocketService.onNotification(addNotification);
    const unsubscribeReviewer = webSocketService.onReviewerNotification((payload) => {
      if (isReviewer) addNotification(payload);
    });
    webSocketService.connect(token, isReviewer);
    return () => { unsubscribe(); unsubscribeReviewer(); webSocketService.disconnect(); };
  }, [token, reset, user, fetchUnreadCount]);
  return <RouterProvider router={router} />;
}

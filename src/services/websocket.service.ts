import { Client, type IFrame, type IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import type { WsNotificationPayload } from '@/types';

type NotificationCallback = (payload: WsNotificationPayload) => void;

class WebSocketService {
  private client: Client | null = null;
  private callbacks = new Set<NotificationCallback>();
  private reviewerCallbacks = new Set<NotificationCallback>();
  private reconnectAttempts = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly maxReconnect = 5;
  private active = false;

  onNotification(callback: NotificationCallback) {
    this.callbacks.add(callback);
    return () => this.callbacks.delete(callback);
  }

  onReviewerNotification(callback: NotificationCallback) {
    this.reviewerCallbacks.add(callback);
    return () => this.reviewerCallbacks.delete(callback);
  }

  connect(token: string, isReviewer: boolean) {
    if (this.active) return;
    this.active = true;
    const socketUrl = `${import.meta.env.VITE_WS_BASE_URL ?? ''}/ws/notification`;
    this.client = new Client({
      webSocketFactory: () => new SockJS(`${socketUrl}?token=${encodeURIComponent(token)}`),
      connectHeaders: { Authorization: `Bearer ${token}` },
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      reconnectDelay: 0,
      onConnect: () => {
        this.reconnectAttempts = 0;
        this.client?.subscribe('/user/queue/notifications', (message: IMessage) => this.dispatch(message, this.callbacks));
        if (isReviewer) {
          this.client?.subscribe('/topic/reviewers', (message: IMessage) => this.dispatch(message, this.reviewerCallbacks));
        }
      },
      onDisconnect: () => this.scheduleReconnect(token, isReviewer),
      onStompError: (frame: IFrame) => {
        console.error('[WS] STOMP error:', frame.headers.message);
        this.scheduleReconnect(token, isReviewer);
      },
    });
    this.client.activate();
  }

  disconnect() {
    this.active = false;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = null;
    void this.client?.deactivate();
    this.client = null;
  }

  private dispatch(message: IMessage, callbacks: Set<NotificationCallback>) {
    try {
      const payload = JSON.parse(message.body) as WsNotificationPayload;
      callbacks.forEach((callback) => callback(payload));
    } catch (error) {
      console.error('[WS] Invalid notification payload:', error);
    }
  }

  private scheduleReconnect(token: string, isReviewer: boolean) {
    if (!this.active || this.reconnectAttempts >= this.maxReconnect || this.reconnectTimer) return;
    this.reconnectAttempts += 1;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.client = null;
      this.active = false;
      this.connect(token, isReviewer);
    }, 3000);
  }
}

export const webSocketService = new WebSocketService();
export default webSocketService;

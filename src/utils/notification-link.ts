import type { SystemNotification } from '@/types';

export function buildReviewPageLink(documentId: string | number) {
  return `/review/documents/${documentId}`;
}

export function resolveNotificationTarget(notification: Pick<SystemNotification, 'type' | 'link'> & { relatedId?: number }) {
  const match = notification.link?.match(/^\/review\/documents\/(\d+)/);
  if (match || (notification.type === 'review' && notification.relatedId)) {
    return { url: match ? notification.link! : buildReviewPageLink(notification.relatedId!), openInNewTab: true };
  }
  return { url: notification.link, openInNewTab: false };
}

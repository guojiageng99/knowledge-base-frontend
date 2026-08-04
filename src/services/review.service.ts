import http from './request';
import type { ReviewTask, User } from '@/types';

interface BackendReviewRecord {
  id: number; documentId: number; documentTitle: string;
  authorId: number | null; authorName: string | null;
  reviewerId: number | null; reviewerName: string | null;
  reviewResult: number | null; reviewComment: string | null;
  beforeStatus: number; reviewedAt: string | null; reviewRound: number;
  reviewLevel?: number; createdAt: string; categoryId: number | null; categoryName: string | null;
}
interface BackendPageResult { records: BackendReviewRecord[]; total: number; current: number; size: number; }

function mapTask(record: BackendReviewRecord): ReviewTask {
  const status = record.reviewResult === 1 ? 'approved' : record.reviewResult === 2 ? 'rejected' : 'pending';
  const author: User = { id: record.authorId ?? undefined, username: record.authorName || '未知', status: 1 };
  return {
    id: String(record.id), documentId: String(record.documentId), documentTitle: record.documentTitle,
    documentAuthor: author, reviewerId: record.reviewerId == null ? '' : String(record.reviewerId),
    reviewer: record.reviewerName ? { id: record.reviewerId ?? undefined, username: record.reviewerName, status: 1 } : undefined,
    status, reviewRound: record.reviewRound, reviewLevel: record.reviewLevel, comment: record.reviewComment || undefined,
    createdAt: record.createdAt, reviewedAt: record.reviewedAt || undefined,
    categoryId: record.categoryId == null ? undefined : String(record.categoryId), categoryName: record.categoryName || undefined,
  };
}

export const reviewService = {
  async getReviewTasks(params?: { status?: string; page?: number; pageSize?: number; authorId?: string; keyword?: string }) {
    const result = await http.get<BackendPageResult>('/document/review/tasks', { params });
    const page = result as unknown as BackendPageResult;
    return { list: page.records.map(mapTask), total: page.total };
  },
  getMyRejectedDocuments: (authorId: string, page = 1, pageSize = 12) =>
    reviewService.getReviewTasks({ status: 'rejected', authorId, page, pageSize }),
  getPendingCount: () => http.get<number>('/document/review/tasks/pending-count'),
  getReviewStats: () => http.get<{ pending: number; approved: number; rejected: number }>('/document/review/tasks/stats'),
  reviewDocument: (taskId: string, data: { status: 'approved' | 'rejected'; comment?: string }) =>
    http.post(`/document/review/tasks/${taskId}/review`, data),
  batchReview: (taskIds: string[], data: { status: 'approved' | 'rejected'; comment?: string }) =>
    http.post('/document/review/tasks/batch-review', { taskIds, ...data }),
  submitForReview: (documentId: number | string) => http.post(`/document/review/submit/${documentId}`),
  async getReviewHistory(documentId: number | string) {
    const records = await http.get<BackendReviewRecord[]>(`/document/review/documents/${documentId}/history`);
    return (records as unknown as BackendReviewRecord[]).map(mapTask);
  },
};

export default reviewService;

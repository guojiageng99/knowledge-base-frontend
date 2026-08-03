import http from './request';
import type { DocumentAccess } from '@/types';

const unwrap = <T>(request: Promise<unknown>) => request as Promise<T>;

export const accessService = {
  recordAccess(documentId: number, documentTitle: string): Promise<boolean> {
    return unwrap<boolean>(http.post('/document/access/record', null, { params: { documentId, documentTitle } }));
  },
  getRecentAccess(limit = 20): Promise<DocumentAccess[]> {
    return unwrap<DocumentAccess[]>(http.get('/document/access/recent', { params: { limit } }));
  },
  deleteAccess(documentId: number): Promise<boolean> {
    return unwrap<boolean>(http.delete(`/document/access/remove/${documentId}`));
  },
  clearAllAccess(): Promise<boolean> {
    return unwrap<boolean>(http.delete('/document/access/clear'));
  },
};

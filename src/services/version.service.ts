import http from './request';
import type { DocumentVersion } from '@/types';

interface VersionPage { records: DocumentVersion[]; total: number; current: number; size: number; }

export const versionService = {
  page: (documentId: string, current = 1, size = 20): Promise<VersionPage> =>
    http.get(`/document/documents/${documentId}/versions`, { params: { current, size } }),
  detail: (documentId: string, versionId: string): Promise<DocumentVersion> =>
    http.get(`/document/documents/${documentId}/versions/${versionId}`),
  compare: (documentId: string, versionId1: string, versionId2: string): Promise<string> =>
    http.get(`/document/documents/${documentId}/versions/compare`, { params: { versionId1, versionId2 } }),
  restore: (documentId: string, versionId: string, reason?: string): Promise<boolean> =>
    http.post(`/document/documents/${documentId}/versions/restore`, { versionId, reason }),
};

export default versionService;

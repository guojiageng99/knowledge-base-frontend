import http from './request';
import type { FileMetadata } from '@/types';

export interface FilePageResult {
  records: FileMetadata[];
  total: number;
  current: number;
  size: number;
  pages: number;
}

export const fileManagementService = {
  getFiles: (data: { current?: number; size?: number; keyword?: string; fileType?: string } = {}): Promise<FilePageResult> => http.post('/file/files/page', data),
  getFile: (fileId: number): Promise<FileMetadata> => http.get(`/file/files/${fileId}`),
  convertFormat: (fileId: number, targetFormat = 'hls'): Promise<string> => http.post(`/file/files/convert/${fileId}`, null, { params: { targetFormat } }),
  deleteFile: (fileId: number): Promise<boolean> => http.delete(`/file/files/${fileId}`),
  getStreamUrl: (fileId: number): string => `/api/file/files/stream/${fileId}/master.m3u8`,
  getThumbnailUrl: (fileId: number): string => `/api/file/files/thumbnail/${fileId}`,
};

export default fileManagementService;

import http from './request';
import type { TagItem } from '@/types';

export interface TagForm {
  id?: string;
  tagName: string;
  tagCode?: string;
  categoryId?: string;
  tagType?: number;
  color?: string;
  icon?: string;
  status?: number;
}

interface TagPage { records: TagItem[]; total: number; current: number; size: number; }

export const tagService = {
  page: (data: Record<string, unknown> = {}): Promise<TagPage> => http.post('/document/tags/page', data),
  create: (data: TagForm): Promise<string> => http.post('/document/tags', data),
  update: (data: TagForm): Promise<boolean> => http.put('/document/tags', data),
  remove: (id: string): Promise<boolean> => http.delete(`/document/tags/${id}`),
};

export default tagService;

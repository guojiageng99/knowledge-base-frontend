import type { CategoryTree } from '@/types';
import http from './request';

export interface CategoryForm {
  id?: number;
  parentId?: number;
  name: string;
  code?: string;
  description?: string;
  icon?: string;
  sortOrder?: number;
  status?: number;
  remark?: string;
}

export const categoryService = {
  getTree: (): Promise<CategoryTree[]> => http.get('/document/categories/tree'),
  create: (data: CategoryForm): Promise<number> => http.post('/document/categories', data),
  update: (data: CategoryForm): Promise<boolean> => http.put('/document/categories', data),
  remove: (id: number): Promise<boolean> => http.delete(`/document/categories/${id}`),
};

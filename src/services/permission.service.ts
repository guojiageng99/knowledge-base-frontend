import type { PermissionItem, PermissionType } from '@/types';
import http from './request';

export interface PermissionForm {
  id?: number;
  name: string;
  code: string;
  type: PermissionType;
  parentId?: number;
  menuUrl?: string;
  apiUrl?: string;
  method?: string;
  icon?: string;
  description?: string;
  sortOrder?: number;
  status?: number;
}

interface PermissionPage { records: PermissionItem[]; total: number; current: number; size: number; }

export const permissionService = {
  tree: (): Promise<PermissionItem[]> => http.get('/auth/permissions/tree'),
  list: (): Promise<PermissionItem[]> => http.get('/auth/permissions/list'),
  page: (params: { current?: number; size?: number; keyword?: string }): Promise<PermissionPage> => http.get('/auth/permissions/page', { params }),
  create: (data: PermissionForm): Promise<number> => http.post('/auth/permissions', data),
  update: (data: PermissionForm): Promise<boolean> => http.put('/auth/permissions', data),
  remove: (id: number): Promise<boolean> => http.delete(`/auth/permissions/${id}`),
};

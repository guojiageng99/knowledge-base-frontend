import type { User } from '@/types';
import http from './request';

export interface UserPage { records: User[]; total: number; current: number; size: number; }
export interface UserForm { id?: number; username: string; password?: string; email?: string; phone?: string; realName?: string; department?: string; position?: string; status?: number; }

export const userService = {
  page: (params: { current?: number; size?: number; keyword?: string; status?: number }): Promise<UserPage> => http.get('/auth/users/page', { params }),
  create: (data: UserForm): Promise<number> => http.post('/auth/users', data),
  update: (data: UserForm): Promise<boolean> => http.put('/auth/users', data),
  remove: (id: number): Promise<boolean> => http.delete(`/auth/users/${id}`),
};

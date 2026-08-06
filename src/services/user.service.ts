import type { User, UserStatistics } from '@/types';
import http from './request';

export interface UserPage { records: User[]; total: number; current: number; size: number; }
export interface UserForm { id?: number; username: string; password?: string; email?: string; phone?: string; realName?: string; department?: string; position?: string; remark?: string; status?: number; }
export interface UserProfileForm { username?: string; email?: string; phone?: string; avatar?: string; realName?: string; department?: string; position?: string; remark?: string; }
export interface InviteUserForm { username: string; email: string; realName: string; phone?: string; teamId: number; }

export const userService = {
  page: (params: { current?: number; size?: number; keyword?: string; status?: number }): Promise<UserPage> => http.get('/auth/users/page', { params }),
  create: (data: UserForm): Promise<number> => http.post('/auth/users', data),
  invite: (data: InviteUserForm) => http.post('/auth/users/invite', data),
  update: (data: UserForm): Promise<boolean> => http.put('/auth/users', data),
  remove: (id: number): Promise<boolean> => http.delete(`/auth/users/${id}`),
  updateProfile: (data: UserProfileForm): Promise<boolean> => http.put('/auth/users/profile', data),
  getUserStats: (userId?: number): Promise<UserStatistics> => http.get(userId ? `/auth/users/${userId}/stats` : '/auth/users/me/stats'),
  changePassword: (oldPassword: string, newPassword: string): Promise<boolean> => http.put('/auth/users/password/change', undefined, { params: { oldPassword, newPassword } }),
};

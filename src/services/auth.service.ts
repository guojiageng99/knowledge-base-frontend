import type { LoginRequest, LoginResponse, User } from '@/types';
import { tokenStorage } from '@/utils/token-storage';
import http from './request';

function unwrap<T>(request: Promise<unknown>): Promise<T> {
  return request as Promise<T>;
}

export const authService = {
  login(data: LoginRequest): Promise<LoginResponse> {
    return unwrap<LoginResponse>(http.post('/auth/auth/login', data, { skipAuth: true }));
  },

  logout(): Promise<void> {
    return unwrap<void>(http.post('/auth/auth/logout')).finally(() => tokenStorage.clearToken());
  },

  getCurrentUser(): Promise<User> {
    return unwrap<User>(http.get('/auth/auth/me'));
  },

  refreshToken(refreshToken: string): Promise<LoginResponse> {
    return unwrap<LoginResponse>(http.post('/auth/auth/refresh', undefined, {
      params: { refreshToken },
      skipAuth: true,
    }));
  },
};

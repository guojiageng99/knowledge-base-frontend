import type { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse, ResetPasswordRequest, SendResetCodeRequest, User, VerifyResetCodeRequest } from '@/types';
import { tokenStorage } from '@/utils/token-storage';
import http from './request';

function unwrap<T>(request: Promise<unknown>): Promise<T> {
  return request as Promise<T>;
}

export const authService = {
  login(data: LoginRequest): Promise<LoginResponse> {
    return unwrap<LoginResponse>(http.post('/auth/auth/login', data, { skipAuth: true }));
  },

  register(data: RegisterRequest): Promise<RegisterResponse> {
    return unwrap<RegisterResponse>(http.post('/auth/auth/register', data, { skipAuth: true }));
  },

  verifyEmail(token: string): Promise<string> {
    return unwrap<string>(http.get('/auth/auth/verify-email', { params: { token }, skipAuth: true }));
  },

  acceptInvite(data: { token: string; password: string; confirmPassword: string }): Promise<string> {
    return unwrap<string>(http.post('/auth/auth/accept-invite', data, { skipAuth: true }));
  },

  sendResetCode(data: SendResetCodeRequest): Promise<void> {
    return unwrap<void>(http.post('/auth/auth/password/reset/send-code', data, { skipAuth: true }));
  },

  verifyResetCode(data: VerifyResetCodeRequest): Promise<boolean> {
    return unwrap<boolean>(http.post('/auth/auth/password/reset/verify-code', data, { skipAuth: true }));
  },

  resetPassword(data: ResetPasswordRequest): Promise<void> {
    return unwrap<void>(http.post('/auth/auth/password/reset', data, { skipAuth: true }));
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

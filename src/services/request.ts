import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { message } from 'antd';
import type { ApiResponse } from '@/types';
import { tokenStorage } from '@/utils/token-storage';

declare module 'axios' {
  export interface AxiosRequestConfig {
    skipAuth?: boolean;
  }
}

const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
  timeout: Number(import.meta.env.VITE_API_TIMEOUT ?? 30000),
  withCredentials: false,
});

http.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (!config.skipAuth) {
    const token = tokenStorage.getAccessToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

http.interceptors.response.use(
  (response) => {
    const body = response.data as ApiResponse<unknown>;
    if (typeof body?.code === 'number' && body.code !== 200) {
      return Promise.reject(new Error(body.message || '请求失败'));
    }
    return body?.data ?? response.data;
  },
  (error: AxiosError<ApiResponse<unknown>>) => {
    const status = error.response?.status;
    const errorMessage = error.response?.data?.message || '网络异常，请稍后重试';
    if (status === 401 || status === 403) {
      tokenStorage.clearToken();
      if (window.location.pathname !== '/login') window.location.replace('/login');
    }
    message.error(errorMessage);
    return Promise.reject(error);
  },
);

export default http;

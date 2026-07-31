export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
  timestamp: number;
}

export interface User {
  id?: number;
  userId?: number;
  username: string;
  nickname?: string;
  email?: string;
  phone?: string | null;
  avatar?: string;
  realName?: string;
  department?: string;
  position?: string;
  status?: number;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginUserInfo {
  userId: number;
  username: string;
  nickname?: string;
  email?: string;
  phone?: string | null;
  avatar?: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  userInfo: LoginUserInfo;
}

export interface TokenInfo {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  expiresAt: number;
}

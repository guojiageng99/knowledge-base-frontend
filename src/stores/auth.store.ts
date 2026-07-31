import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '@/services/auth.service';
import type { LoginResponse, TokenInfo, User } from '@/types';
import { tokenStorage } from '@/utils/token-storage';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
  checkAuth: () => Promise<void>;
  clearAuth: () => void;
}

function saveLogin(response: LoginResponse): TokenInfo {
  const tokenInfo: TokenInfo = {
    accessToken: response.accessToken,
    refreshToken: response.refreshToken,
    tokenType: response.tokenType,
    expiresIn: response.expiresIn,
    expiresAt: Date.now() + response.expiresIn * 1000,
  };
  tokenStorage.setToken(tokenInfo);
  return tokenInfo;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (username, password) => {
        set({ isLoading: true });
        try {
          const response = await authService.login({ username, password });
          const tokenInfo = saveLogin(response);
          set({ user: response.userInfo, token: tokenInfo.accessToken, isAuthenticated: true });
        } finally {
          set({ isLoading: false });
        }
      },

      logout: async () => {
        try {
          await authService.logout();
        } finally {
          set({ user: null, token: null, isAuthenticated: false });
        }
      },

      updateUser: (user) => set({ user }),

      checkAuth: async () => {
        const tokenInfo = tokenStorage.getTokenInfo();
        if (!tokenInfo) {
          set({ user: null, token: null, isAuthenticated: false });
          return;
        }

        set({ isLoading: true });
        try {
          if (tokenStorage.isTokenExpired()) {
            const response = await authService.refreshToken(tokenInfo.refreshToken);
            const refreshed = saveLogin(response);
            set({ user: response.userInfo, token: refreshed.accessToken, isAuthenticated: true });
            return;
          }
          const user = await authService.getCurrentUser();
          set({ user, token: tokenInfo.accessToken, isAuthenticated: true });
        } catch {
          tokenStorage.clearToken();
          set({ user: null, token: null, isAuthenticated: false });
        } finally {
          set({ isLoading: false });
        }
      },

      clearAuth: () => {
        tokenStorage.clearToken();
        set({ user: null, token: null, isAuthenticated: false });
      },
    }),
    {
      name: 'kb-auth-state',
      partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
    },
  ),
);

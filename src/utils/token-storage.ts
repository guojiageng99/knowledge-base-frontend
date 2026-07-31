import type { TokenInfo } from '@/types';
import { cookie } from './cookie';

const TOKEN_KEY = 'kb_access_token';
const REFRESH_TOKEN_KEY = 'kb_refresh_token';
const TOKEN_INFO_KEY = 'kb_token_info';

class TokenStorage {
  setToken(tokenInfo: TokenInfo): void {
    const payload = JSON.stringify(tokenInfo);
    localStorage.setItem(TOKEN_INFO_KEY, payload);
    cookie.set(TOKEN_KEY, tokenInfo.accessToken, { expires: 7, path: '/', sameSite: 'lax' });
    cookie.set(REFRESH_TOKEN_KEY, tokenInfo.refreshToken, { expires: 7, path: '/', sameSite: 'lax' });
  }

  getTokenInfo(): TokenInfo | null {
    const stored = localStorage.getItem(TOKEN_INFO_KEY);
    if (!stored) return null;
    try {
      return JSON.parse(stored) as TokenInfo;
    } catch {
      this.clearToken();
      return null;
    }
  }

  getAccessToken(): string | null {
    return cookie.get(TOKEN_KEY) ?? this.getTokenInfo()?.accessToken ?? null;
  }

  getRefreshToken(): string | null {
    return cookie.get(REFRESH_TOKEN_KEY) ?? this.getTokenInfo()?.refreshToken ?? null;
  }

  isTokenExpired(): boolean {
    const tokenInfo = this.getTokenInfo();
    return !tokenInfo || tokenInfo.expiresAt <= Date.now();
  }

  clearToken(): void {
    localStorage.removeItem(TOKEN_INFO_KEY);
    cookie.remove(TOKEN_KEY);
    cookie.remove(REFRESH_TOKEN_KEY);
  }
}

export const tokenStorage = new TokenStorage();

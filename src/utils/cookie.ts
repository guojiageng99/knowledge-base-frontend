interface CookieOptions {
  expires?: number;
  path?: string;
  domain?: string;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
}

class CookieManager {
  set(name: string, value: string, options: CookieOptions = {}): void {
    let cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

    if (options.expires) {
      const date = new Date();
      date.setDate(date.getDate() + options.expires);
      cookie += `; expires=${date.toUTCString()}`;
    }
    if (options.path) cookie += `; path=${options.path}`;
    if (options.domain) cookie += `; domain=${options.domain}`;
    if (options.secure) cookie += '; secure';
    if (options.sameSite) cookie += `; samesite=${options.sameSite}`;

    document.cookie = cookie;
  }

  get(name: string): string | null {
    const prefix = `${encodeURIComponent(name)}=`;
    const cookie = document.cookie.split('; ').find((item) => item.startsWith(prefix));
    return cookie ? decodeURIComponent(cookie.substring(prefix.length)) : null;
  }

  remove(name: string, path = '/'): void {
    this.set(name, '', { expires: -1, path });
  }
}

export const cookie = new CookieManager();

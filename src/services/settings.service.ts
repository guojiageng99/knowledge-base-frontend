import http from './request';
import type { SystemSettings, SystemStatus } from '@/types';

const BASE_URL = '/foundation/config/settings';

export const settingsService = {
  getSettings: (): Promise<SystemSettings> => http.get(BASE_URL) as unknown as Promise<SystemSettings>,
  updateSettings: (section: string, settings: Record<string, unknown>): Promise<boolean> =>
    http.put(BASE_URL, { section, settings }) as unknown as Promise<boolean>,
  getSystemStatus: (): Promise<SystemStatus> => http.get(`${BASE_URL}/status`) as unknown as Promise<SystemStatus>,
  clearCache: (): Promise<string> => http.post(`${BASE_URL}/cache/clear`) as unknown as Promise<string>,
  createBackup: (): Promise<string> => http.post(`${BASE_URL}/backup`) as unknown as Promise<string>,
};

export default settingsService;

import http from './request';
import type { SearchHistory, SearchResult } from '@/types';

export interface SearchPageResult {
  records: SearchResult[];
  total: number;
  current: number;
  size: number;
  pages: number;
}

export const searchService = {
  search: (data: { keyword: string; searchMode?: 'keyword' | 'hybrid'; current?: number; size?: number; topK?: number; enableRerank?: boolean }): Promise<SearchPageResult> => http.post('/search', data, { silentError: true }),
  suggest: (keyword: string): Promise<Array<{ text: string; type: string; documentId?: number }>> => http.get('/search/suggest', { params: { keyword }, silentError: true }),
  history: (): Promise<SearchHistory[]> => http.get('/search/history', { silentError: true }),
  hot: (): Promise<string[]> => http.get('/search/hot', { silentError: true }),
  clearHistory: (): Promise<boolean> => http.delete('/search/history', { silentError: true }),
};

export default searchService;

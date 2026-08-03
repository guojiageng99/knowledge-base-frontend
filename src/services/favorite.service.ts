import http from './request';
import type { UserFavorite } from '@/types';

const unwrap = <T>(request: Promise<unknown>) => request as Promise<T>;

export const favoriteService = {
  toggleFavorite(documentId: number): Promise<boolean> {
    return unwrap<boolean>(http.post(`/document/favorite/toggle/${documentId}`));
  },
  addFavorite(documentId: number): Promise<boolean> {
    return unwrap<boolean>(http.post(`/document/favorite/add/${documentId}`));
  },
  removeFavorite(documentId: number): Promise<boolean> {
    return unwrap<boolean>(http.delete(`/document/favorite/remove/${documentId}`));
  },
  checkFavorite(documentId: number): Promise<boolean> {
    return unwrap<boolean>(http.get(`/document/favorite/check/${documentId}`));
  },
  getFavorites(): Promise<UserFavorite[]> {
    return unwrap<UserFavorite[]>(http.get('/document/favorite/list'));
  },
  getFavoriteCount(documentId: number): Promise<number> {
    return unwrap<number>(http.get(`/document/favorite/count/${documentId}`));
  },
};

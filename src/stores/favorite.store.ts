import { create } from 'zustand';
import type { UserFavorite } from '@/types';
import { favoriteService } from '@/services/favorite.service';

interface FavoriteState {
  favorites: Record<number, boolean>;
  favoriteDocuments: UserFavorite[];
  isLoading: boolean;
  toggleFavorite: (documentId: number) => Promise<boolean>;
  checkFavorite: (documentId: number) => Promise<void>;
  loadFavorites: () => Promise<void>;
  isFavorited: (documentId: number) => boolean;
}

export const useFavoriteStore = create<FavoriteState>((set, get) => ({
  favorites: {},
  favoriteDocuments: [],
  isLoading: false,
  async toggleFavorite(documentId) {
    const isFavorited = await favoriteService.toggleFavorite(documentId);
    set((state) => ({ favorites: { ...state.favorites, [documentId]: isFavorited } }));
    return isFavorited;
  },
  async checkFavorite(documentId) {
    const isFavorited = await favoriteService.checkFavorite(documentId);
    set((state) => ({ favorites: { ...state.favorites, [documentId]: isFavorited } }));
  },
  async loadFavorites() {
    set({ isLoading: true });
    try {
      const favoriteDocuments = await favoriteService.getFavorites();
      const favorites = Object.fromEntries(favoriteDocuments.map((item) => [item.documentId, true]));
      set({ favoriteDocuments, favorites, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },
  isFavorited: (documentId) => get().favorites[documentId] === true,
}));

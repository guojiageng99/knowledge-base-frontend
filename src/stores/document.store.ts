import { create } from 'zustand';
import type { DocumentFilter, DocumentForm, KnowledgeDocument } from '@/types';
import { documentService } from '@/services/document.service';

interface DocumentState {
  documents: KnowledgeDocument[];
  currentDocument: KnowledgeDocument | null;
  isLoading: boolean;
  total: number;
  current: number;
  size: number;
  filter: DocumentFilter;
  fetchDocuments: (filter?: DocumentFilter) => Promise<void>;
  fetchDocument: (id: number, incrementView?: boolean) => Promise<void>;
  createDocument: (data: DocumentForm) => Promise<number>;
  updateDocument: (id: number, data: DocumentForm) => Promise<void>;
  deleteDocument: (id: number) => Promise<void>;
  likeDocument: (id: number) => Promise<void>;
  updateFavoriteStatus: (id: number, isFavorited: boolean) => void;
  setFilter: (filter: DocumentFilter) => void;
}

const initialFilter: DocumentFilter = { current: 1, size: 10 };

export const useDocumentStore = create<DocumentState>((set, get) => ({
  documents: [],
  currentDocument: null,
  isLoading: false,
  total: 0,
  current: 1,
  size: 10,
  filter: initialFilter,

  async fetchDocuments(filter = {}) {
    if (get().isLoading) return;
    const nextFilter = { ...get().filter, ...filter };
    set({ isLoading: true, filter: nextFilter });
    try {
      const page = await documentService.getDocuments(nextFilter);
      set({
        documents: page.records,
        total: page.total,
        current: page.current,
        size: page.size,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  async fetchDocument(id, incrementView = false) {
    set({ isLoading: true });
    try {
      const document = incrementView
        ? await documentService.viewDocument(id)
        : await documentService.getDocument(id);
      set({ currentDocument: document, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  async createDocument(data) {
    return documentService.createDocument(data);
  },

  async updateDocument(id, data) {
    await documentService.updateDocument(id, data);
    const currentDocument = get().currentDocument;
    if (currentDocument?.id === id) {
      set({ currentDocument: { ...currentDocument, ...data, id } });
    }
  },

  async deleteDocument(id) {
    await documentService.deleteDocument(id);
    set((state) => ({
      documents: state.documents.filter((document) => document.id !== id),
      total: Math.max(0, state.total - 1),
      currentDocument: state.currentDocument?.id === id ? null : state.currentDocument,
    }));
  },

  async likeDocument(id) {
    const currentDocument = get().currentDocument;
    const current = currentDocument?.id === id
      ? currentDocument
      : get().documents.find((document) => document.id === id);
    const wasLiked = current?.isLiked ?? false;
    const delta = wasLiked ? -1 : 1;
    const apply = (isLiked: boolean, countDelta: number) => set((state) => ({
      documents: state.documents.map((document) => document.id === id
        ? { ...document, isLiked, likeCount: Math.max(0, document.likeCount + countDelta) }
        : document),
      currentDocument: state.currentDocument?.id === id
        ? { ...state.currentDocument, isLiked, likeCount: Math.max(0, state.currentDocument.likeCount + countDelta) }
        : state.currentDocument,
    }));
    apply(!wasLiked, delta);
    try {
      if (wasLiked) await documentService.unlikeDocument(id);
      else await documentService.likeDocument(id);
    } catch (error) {
      apply(wasLiked, -delta);
      throw error;
    }
  },

  updateFavoriteStatus(id, isFavorited) {
    const delta = isFavorited ? 1 : -1;
    set((state) => ({
      documents: state.documents.map((document) => document.id === id
        ? { ...document, favoriteCount: Math.max(0, document.favoriteCount + delta) }
        : document),
      currentDocument: state.currentDocument?.id === id
        ? { ...state.currentDocument, favoriteCount: Math.max(0, state.currentDocument.favoriteCount + delta) }
        : state.currentDocument,
    }));
  },

  setFilter(filter) {
    set((state) => ({ filter: { ...state.filter, ...filter } }));
  },
}));

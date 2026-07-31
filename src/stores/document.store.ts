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
    await documentService.likeDocument(id);
    set((state) => ({
      documents: state.documents.map((document) => document.id === id
        ? { ...document, likeCount: document.likeCount + 1 }
        : document),
      currentDocument: state.currentDocument?.id === id
        ? { ...state.currentDocument, likeCount: state.currentDocument.likeCount + 1 }
        : state.currentDocument,
    }));
  },

  setFilter(filter) {
    set((state) => ({ filter: { ...state.filter, ...filter } }));
  },
}));

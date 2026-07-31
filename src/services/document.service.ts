import type { DocumentFilter, DocumentForm, DocumentPage, KnowledgeDocument } from '@/types';
import http from './request';

function unwrap<T>(request: Promise<unknown>): Promise<T> {
  return request as Promise<T>;
}

export const documentService = {
  getDocuments(filter: DocumentFilter = {}): Promise<DocumentPage> {
    return unwrap<DocumentPage>(http.get('/document/documents/page', { params: filter }));
  },

  getDocument(id: number): Promise<KnowledgeDocument> {
    return unwrap<KnowledgeDocument>(http.get(`/document/documents/${id}`));
  },

  viewDocument(id: number): Promise<KnowledgeDocument> {
    return unwrap<KnowledgeDocument>(http.get(`/document/documents/${id}/view`));
  },

  createDocument(data: DocumentForm): Promise<number> {
    return unwrap<number>(http.post('/document/documents', data));
  },

  updateDocument(id: number, data: DocumentForm): Promise<boolean> {
    return unwrap<boolean>(http.put('/document/documents', { ...data, id }));
  },

  deleteDocument(id: number): Promise<boolean> {
    return unwrap<boolean>(http.delete(`/document/documents/${id}`));
  },

  likeDocument(id: number): Promise<boolean> {
    return unwrap<boolean>(http.post(`/document/documents/${id}/like`));
  },
};

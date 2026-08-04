import type { DocumentFilter, DocumentForm, DocumentPage, KnowledgeDocument, ShareForm, ShareVO } from '@/types';
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

  saveDocumentContent(id: number, content: string): Promise<boolean> {
    return unwrap<boolean>(http.post(`/document/documents/${id}/content`, content, {
      headers: { 'Content-Type': 'text/plain' },
    }));
  },

  getDocumentContent(id: number): Promise<string> {
    return unwrap<string>(http.get(`/document/documents/${id}/content`));
  },

  uploadImageFromUrl(url: string): Promise<string> {
    return unwrap<string>(http.post('/document/documents/upload-image-from-url', null, { params: { imageUrl: url } }));
  },

  downloadDocumentPdf(id: number): Promise<Blob> {
    return unwrap<Blob>(http.get(`/document/documents/${id}/download-pdf`, { responseType: 'blob' }));
  },

  exportDocumentToPdf(id: number): Promise<string> {
    return unwrap<string>(http.get(`/document/documents/${id}/export-pdf`));
  },

  createShare(data: ShareForm): Promise<ShareVO> {
    return unwrap<ShareVO>(http.post('/document/documents/share', data));
  },

  getDocumentShares(id: number): Promise<ShareVO[]> {
    return unwrap<ShareVO[]>(http.get(`/document/documents/${id}/shares`));
  },

  getShareInfo(shareId: string): Promise<ShareVO> {
    return unwrap<ShareVO>(http.get(`/document/documents/share/${shareId}`));
  },

  accessShare(shareId: string, password?: string): Promise<number> {
    return unwrap<number>(http.post(`/document/documents/share/${shareId}/access`, null, {
      params: password ? { password } : {},
    }));
  },

  getMyShares(): Promise<ShareVO[]> {
    return unwrap<ShareVO[]>(http.get('/document/documents/share/my'));
  },

  updateShare(shareId: string, data: Partial<ShareForm>): Promise<boolean> {
    return unwrap<boolean>(http.put(`/document/documents/share/${shareId}`, data));
  },

  deleteShare(shareId: string): Promise<boolean> {
    return unwrap<boolean>(http.delete(`/document/documents/share/${shareId}`));
  },

  getPublicShareInfo(shareId: string): Promise<ShareVO> {
    return unwrap<ShareVO>(http.get(`/document/share/${shareId}`, { skipAuth: true }));
  },

  verifyPublicShare(shareId: string, password?: string): Promise<boolean> {
    return unwrap<boolean>(http.post(`/document/share/${shareId}/verify`, null, {
      params: password ? { password } : {}, skipAuth: true,
    }));
  },

  accessPublicShare(shareId: string, password?: string): Promise<KnowledgeDocument> {
    return unwrap<KnowledgeDocument>(http.post(`/document/share/${shareId}/access`, null, {
      params: password ? { password } : {}, skipAuth: true,
    }));
  },
};

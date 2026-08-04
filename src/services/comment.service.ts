import type { CommentCreateForm, CommentPage, CommentQuery } from '@/types';
import http from './request';

const unwrap = <T>(request: Promise<unknown>) => request as Promise<T>;

export const commentService = {
  getDocumentComments(documentId: number, query: CommentQuery = {}): Promise<CommentPage> {
    return unwrap<CommentPage>(http.post(`/document/comments/document/${documentId}`, query));
  },

  createComment(data: CommentCreateForm): Promise<number> {
    return unwrap<number>(http.post('/document/comments', data));
  },

  deleteComment(commentId: number): Promise<boolean> {
    return unwrap<boolean>(http.delete(`/document/comments/${commentId}`));
  },

  likeComment(commentId: number): Promise<boolean> {
    return unwrap<boolean>(http.post(`/document/comments/${commentId}/like`));
  },

  unlikeComment(commentId: number): Promise<boolean> {
    return unwrap<boolean>(http.delete(`/document/comments/${commentId}/like`));
  },
};

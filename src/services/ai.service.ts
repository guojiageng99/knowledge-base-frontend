import http from './request';
import type { AxiosResponse } from 'axios';
import type { AIConversation, AIModelOption, AIRequest, AIFeedback } from '@/types';
import { tokenStorage } from '@/utils/token-storage';

const apiBase = import.meta.env.VITE_API_BASE_URL ?? '/api';

export interface AIStreamResult {
  conversationId: string | number;
  messageId?: string | number;
  content?: string;
  tokens?: number;
  citations?: import('@/types').Citation[];
  fromKnowledgeBase?: boolean;
}

async function unwrap<T>(request: Promise<AxiosResponse<T> | T>): Promise<T> {
  const response = await request;
  return (response as AxiosResponse<T>).data ?? response as T;
}

export const aiService = {
  getModels: (): Promise<AIModelOption[]> => unwrap(http.get<AIModelOption[]>('/ai/chat/models')),
  ask: (data: AIRequest): Promise<{ content: string; conversationId: string; messageId: string; tokens: number }> =>
    unwrap(http.post('/ai/chat', { content: data.question, conversationId: data.conversationId, model: data.model })),
  getConversations: async (): Promise<AIConversation[]> => {
    const page = await unwrap(http.get<{ records: AIConversation[] }>('/ai/conversation/list'));
    return page?.records ?? [];
  },
  getConversation: (id: string | number): Promise<AIConversation> => unwrap(http.get(`/ai/conversation/${id}`)),
  createConversation: (title: string): Promise<AIConversation> => unwrap(http.post('/ai/conversation', { title })),
  deleteConversation: (id: string | number): Promise<unknown> => unwrap(http.delete(`/ai/conversation/${id}`)),
  submitFeedback: (data: AIFeedback): Promise<unknown> => unwrap(http.post('/ai/feedback', {
    conversationId: data.conversationId,
    messageId: data.messageId,
    feedbackType: data.type === 'like' ? 'positive' : 'negative',
    feedbackContent: data.comment,
  })),
  askStream: async (data: AIRequest, onMessage: (chunk: string) => void, onDone: (result: AIStreamResult) => void, onError: (error: string) => void) => {
    const response = await fetch(`${apiBase}/ai/chat/stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: tokenStorage.getAuthorizationHeader() },
      body: JSON.stringify({ content: data.question, conversationId: data.conversationId, model: data.model, enableRag: data.knowledgeBase === true }),
    });
    if (!response.ok || !response.body) throw new Error(`AI service request failed (HTTP ${response.status})`);
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let event = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';
      for (const line of lines) {
        if (line.startsWith('event:')) { event = line.slice(6).trim(); continue; }
        if (!line.startsWith('data:')) continue;
        const payload = line.startsWith('data: ') ? line.slice(6) : line.slice(5);
        if (event === 'message') onMessage(payload);
        else if (event === 'done') { try { onDone(JSON.parse(payload) as AIStreamResult); } catch { onError('Invalid AI stream completion response'); } }
        else if (event === 'error') onError(payload);
      }
    }
  },
};

export default aiService;

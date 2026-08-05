import http from './request';
import type { AxiosResponse } from 'axios';
import type { AIConversation, AIModelOption, AIRequest, AIFeedback, DocumentProcessResult, WritingRequest, WritingResult, WritingTemplate } from '@/types';
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

export function createBatchedCallback(onFlush: (value: string) => void, interval = 80) {
  let pending = '';
  let timer: ReturnType<typeof setTimeout> | undefined;
  const flush = () => { if (!pending) return; const value = pending; pending = ''; onFlush(value); };
  return {
    push(value: string) { pending += value; if (!timer) timer = setTimeout(() => { timer = undefined; flush(); }, interval); },
    flush() { if (timer) { clearTimeout(timer); timer = undefined; } flush(); },
  };
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
    let dataLines: string[] = [];
    const batched = createBatchedCallback(onMessage);
    const dispatch = () => {
      if (!dataLines.length) return;
      const payload = dataLines.join('\n'); dataLines = [];
      if (event === 'message') batched.push(payload);
      else if (event === 'done') { if (payload === '[DONE]') { batched.flush(); return; } try { batched.flush(); onDone(JSON.parse(payload) as AIStreamResult); } catch { onError('Invalid AI stream completion response'); } }
      else if (event === 'error') onError(payload);
    };
    while (true) {
      const { done, value } = await reader.read();
      if (done) { buffer += decoder.decode(); break; }
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';
      for (const line of lines) {
        if (!line.trim()) { dispatch(); event = ''; continue; }
        if (line.startsWith('event:')) { event = line.slice(6).trim(); continue; }
        if (line.startsWith('data:')) dataLines.push(line.startsWith('data: ') ? line.slice(6) : line.slice(5));
      }
    }
    if (buffer.trim() && buffer.startsWith('data:')) dataLines.push(buffer.startsWith('data: ') ? buffer.slice(6) : buffer.slice(5));
    dispatch(); batched.flush();
  },
  getWritingTemplates: (): Promise<WritingTemplate[]> => unwrap(http.get<WritingTemplate[]>('/ai/writing/templates')),
  generateWriting: (data: WritingRequest): Promise<WritingResult> => unwrap(http.post<WritingResult>('/ai/writing/generate', { ...data, actionType: 'generate' })),
  generateWritingStream: async (data: WritingRequest, onMessage: (chunk: string) => void, onDone?: (result: WritingResult) => void, onError?: (error: string) => void) => {
    const response = await fetch(`${apiBase}/ai/writing/generate/stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: tokenStorage.getAuthorizationHeader() },
      body: JSON.stringify({ ...data, actionType: 'generate' }),
    });
    if (!response.ok || !response.body) throw new Error(`AI writing request failed (HTTP ${response.status})`);
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let event = '';
    let messageLines: string[] = [];
    const flush = () => { if (messageLines.length) { onMessage(messageLines.join('\n')); messageLines = []; } };
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split(/\r?\n/);
      buffer = lines.pop() ?? '';
      for (const line of lines) {
        if (line.startsWith('event:')) { flush(); event = line.slice(6).trim(); continue; }
        if (line.startsWith('data:')) {
          const payload = line.startsWith('data: ') ? line.slice(6) : line.slice(5);
          if (event === 'error') onError?.(payload);
          else if (event === 'done') { try { onDone?.(JSON.parse(payload) as WritingResult); } catch { onError?.('Invalid AI writing completion response'); } }
          else messageLines.push(payload);
        } else if (!line.trim()) { flush(); event = ''; }
      }
    }
    flush();
  },
  expandWriting: (data: WritingRequest): Promise<WritingResult> => unwrap(http.post<WritingResult>('/ai/writing/expand', { ...data, actionType: 'expand' })),
  optimizeWriting: (data: WritingRequest): Promise<WritingResult> => unwrap(http.post<WritingResult>('/ai/writing/optimize', { ...data, actionType: 'optimize' })),
  continueWriting: (data: WritingRequest): Promise<WritingResult> => unwrap(http.post<WritingResult>('/ai/writing/continue', { ...data, actionType: 'continue' })),
  generateDocSummary: (params: { content: string; title?: string; length?: number }): Promise<DocumentProcessResult> => unwrap(http.post<DocumentProcessResult>('/ai/document/summary/content', {
    content: params.content,
    title: params.title || '',
    processType: 'summary',
    processParams: { summaryLength: params.length || 200 },
  })),
  generateDocSummaryStream: async (
    params: { content: string; title?: string; length?: number },
    onChunk: (chunk: string) => void,
    onDone?: (result: DocumentProcessResult) => void,
    onError?: (error: string) => void,
    signal?: AbortSignal,
  ) => {
    const response = await fetch(`${apiBase}/ai/document/summary/content/stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: tokenStorage.getAuthorizationHeader() },
      body: JSON.stringify({ content: params.content, title: params.title || '', processType: 'summary', processParams: { summaryLength: params.length || 200 } }),
      signal,
    });
    if (!response.ok || !response.body) throw new Error(`AI summary request failed (HTTP ${response.status})`);
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let event = '';
    let messageLines: string[] = [];
    const flush = () => { if (messageLines.length) { onChunk(messageLines.join('\n')); messageLines = []; } };
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split(/\r?\n/);
      buffer = lines.pop() || '';
      for (const line of lines) {
        if (line.startsWith('event:')) { flush(); event = line.slice(6).trim(); continue; }
        if (line.startsWith('data:')) {
          const payload = line.startsWith('data: ') ? line.slice(6) : line.slice(5);
          if (event === 'error') onError?.(payload);
          else if (event === 'done') { try { onDone?.(JSON.parse(payload) as DocumentProcessResult); } catch { onError?.('Invalid AI summary completion response'); } }
          else messageLines.push(payload);
        } else if (!line.trim()) { flush(); event = ''; }
      }
    }
    flush();
  },
};

export default aiService;

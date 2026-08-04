import { create } from 'zustand';
import { aiService } from '@/services';
import type { AIConversation, AIMessage, AIModelOption } from '@/types';

interface AIState {
  conversations: AIConversation[];
  currentConversation: AIConversation | null;
  availableModels: AIModelOption[];
  selectedModel: string;
  isLoading: boolean;
  isStreaming: boolean;
  currentResponse: string;
  ragEnabled: boolean;
  fetchConversations: () => Promise<void>;
  fetchModels: () => Promise<void>;
  createConversation: (title: string) => Promise<void>;
  selectConversation: (conversation: AIConversation | null) => Promise<void>;
  deleteConversation: (id: string | number) => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  setSelectedModel: (model: string) => void;
  toggleRag: (enabled: boolean) => void;
}

export const useAIStore = create<AIState>((set, get) => ({
  conversations: [], currentConversation: null, availableModels: [], selectedModel: 'qwen',
  isLoading: false, isStreaming: false, currentResponse: '', ragEnabled: false,
  fetchConversations: async () => {
    set({ isLoading: true });
    try { set({ conversations: await aiService.getConversations() }); } finally { set({ isLoading: false }); }
  },
  fetchModels: async () => {
    try { const models = await aiService.getModels(); set({ availableModels: models, selectedModel: models.find((m) => m.isDefault)?.key ?? get().selectedModel }); } catch { /* keys may be absent until API credentials are configured */ }
  },
  createConversation: async (title) => { const conversation = await aiService.createConversation(title); set((s) => ({ conversations: [conversation, ...s.conversations], currentConversation: conversation })); },
  selectConversation: async (conversation) => {
    if (!conversation) { set({ currentConversation: null }); return; }
    set({ currentConversation: conversation });
    const detail = await aiService.getConversation(conversation.id);
    set((s) => ({ currentConversation: detail, conversations: s.conversations.map((c) => String(c.id) === String(detail.id) ? detail : c) }));
  },
  deleteConversation: async (id) => { await aiService.deleteConversation(id); set((s) => ({ conversations: s.conversations.filter((c) => String(c.id) !== String(id)), currentConversation: String(s.currentConversation?.id) === String(id) ? null : s.currentConversation })); },
  sendMessage: async (content) => {
    const old = get().currentConversation;
    set({ isLoading: true, isStreaming: true, currentResponse: '' });
    const userMessage: AIMessage = { id: `local-${Date.now()}`, role: 'user', content, timestamp: new Date().toISOString() };
    const conversation = old ?? { id: '', title: content.slice(0, 30), messages: [] };
    set({ currentConversation: { ...conversation, messages: [...(conversation.messages ?? []), userMessage] } });
    let conversationId: string | number | undefined = old?.id || undefined; let answer = ''; let citations: AIMessage['citations']; let fromKnowledgeBase = false;
    try {
      await aiService.askStream({ question: content, conversationId, model: get().selectedModel, knowledgeBase: get().ragEnabled }, (chunk) => { answer += chunk; set({ currentResponse: answer }); }, (result) => { conversationId = result.conversationId; citations = result.citations; fromKnowledgeBase = result.fromKnowledgeBase ?? false; }, (error) => { throw new Error(error); });
      const assistant: AIMessage = { id: `local-${Date.now()}-answer`, role: 'assistant', content: answer, timestamp: new Date().toISOString(), citations, fromKnowledgeBase };
      set((s) => { const current = s.currentConversation; if (!current) return {}; const updated = { ...current, id: conversationId ?? current.id, messages: [...(current.messages ?? []), assistant] }; return { currentConversation: updated, conversations: [updated, ...s.conversations.filter((c) => String(c.id) !== String(updated.id))], isLoading: false, isStreaming: false, currentResponse: '' }; });
    } catch (error) { set({ isLoading: false, isStreaming: false, currentResponse: '' }); throw error; }
  },
  setSelectedModel: (selectedModel) => set({ selectedModel }),
  toggleRag: (ragEnabled) => set({ ragEnabled }),
}));

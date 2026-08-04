import { create } from 'zustand';
import { aiService } from '@/services';
import type { WritingRequest, WritingResult, WritingTemplate } from '@/types';

interface AIWritingState {
  templates: WritingTemplate[];
  generatedContent: string;
  isGenerating: boolean;
  isStreaming: boolean;
  tokens: number;
  wordCount: number;
  lastResult: WritingResult | null;
  error: string | null;
  fetchTemplates: () => Promise<void>;
  generateContent: (data: WritingRequest) => Promise<WritingResult>;
  generateContentStream: (data: WritingRequest) => Promise<WritingResult>;
  expandContent: (data: WritingRequest) => Promise<WritingResult>;
  optimizeContent: (data: WritingRequest) => Promise<WritingResult>;
  continueWriting: (data: WritingRequest) => Promise<WritingResult>;
  setGeneratedContent: (content: string) => void;
  clearResult: () => void;
  reset: () => void;
}

const resultOf = (result: WritingResult) => ({ generatedContent: result.content || '', tokens: result.tokens || 0, wordCount: result.wordCount || 0, lastResult: result, isGenerating: false, isStreaming: false, error: null });

export const useAIWritingStore = create<AIWritingState>((set) => ({
  templates: [], generatedContent: '', isGenerating: false, isStreaming: false, tokens: 0, wordCount: 0, lastResult: null, error: null,
  fetchTemplates: async () => { try { set({ templates: await aiService.getWritingTemplates() }); } catch { set({ error: '获取写作模板失败' }); } },
  generateContent: async (data) => { set({ isGenerating: true, error: null, generatedContent: '' }); try { const result = await aiService.generateWriting(data); set(resultOf(result)); return result; } catch (error) { set({ isGenerating: false, error: error instanceof Error ? error.message : '生成失败' }); throw error; } },
  generateContentStream: async (data) => {
    set({ isGenerating: true, isStreaming: true, error: null, generatedContent: '', tokens: 0, wordCount: 0 });
    let content = '';
    try {
      await aiService.generateWritingStream(data, (chunk) => { content += chunk; set({ generatedContent: content }); }, (result) => set(resultOf({ ...result, content: result.content || content })), (error) => set({ isGenerating: false, isStreaming: false, error }));
      const result = { content, tokens: 0, wordCount: content.length, model: '' };
      set((state) => state.lastResult ? state : resultOf(result));
      return result;
    } catch (error) { set({ isGenerating: false, isStreaming: false, error: error instanceof Error ? error.message : '流式生成失败' }); throw error; }
  },
  expandContent: async (data) => { set({ isGenerating: true, error: null }); try { const result = await aiService.expandWriting(data); set(resultOf(result)); return result; } catch (error) { set({ isGenerating: false, error: error instanceof Error ? error.message : '扩写失败' }); throw error; } },
  optimizeContent: async (data) => { set({ isGenerating: true, error: null }); try { const result = await aiService.optimizeWriting(data); set(resultOf(result)); return result; } catch (error) { set({ isGenerating: false, error: error instanceof Error ? error.message : '优化失败' }); throw error; } },
  continueWriting: async (data) => { set({ isGenerating: true, error: null }); try { const result = await aiService.continueWriting(data); set(resultOf(result)); return result; } catch (error) { set({ isGenerating: false, error: error instanceof Error ? error.message : '续写失败' }); throw error; } },
  setGeneratedContent: (content) => set({ generatedContent: content }),
  clearResult: () => set({ generatedContent: '', tokens: 0, wordCount: 0, lastResult: null, error: null }),
  reset: () => set({ templates: [], generatedContent: '', isGenerating: false, isStreaming: false, tokens: 0, wordCount: 0, lastResult: null, error: null }),
}));

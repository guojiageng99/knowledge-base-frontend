import { create } from 'zustand';
import http from '@/services/request';

interface AppState {
  systemName: string;
  systemDescription: string;
  requireApproval: boolean;
  enableComments: boolean;
  enableAI: boolean;
  enableAIWriting: boolean;
  enableFullTextSearch: boolean;
  enableEmail: boolean;
  enableWebSocket: boolean;
  maxFileSize: number;
  allowedFileTypes: string;
  loaded: boolean;
  fetchAppConfig: () => Promise<void>;
  refreshAppConfig: () => Promise<void>;
}

const BOOLEAN_CONFIG_MAP: Record<string, [keyof AppState, boolean]> = {
  'system.requireApproval': ['requireApproval', true],
  'system.enableComments': ['enableComments', true],
  'system.enableAI': ['enableAI', true],
  'system.enableAIWriting': ['enableAIWriting', true],
  'system.enableFullTextSearch': ['enableFullTextSearch', true],
  'email.enabled': ['enableEmail', true],
  'websocket.enabled': ['enableWebSocket', true],
};

async function loadConfig(set: (state: Partial<AppState>) => void) {
  try {
    const configs = await http.get('/foundation/config/public') as unknown as Record<string, string>;
    const booleanUpdates: Record<string, boolean> = {};
    for (const [key, [storeKey, defaultValue]] of Object.entries(BOOLEAN_CONFIG_MAP)) {
      booleanUpdates[storeKey] = configs[key] === undefined ? defaultValue : configs[key] === 'true';
    }
    const systemName = configs['system.name'] || 'Knowledge Base';
    set({
      systemName,
      systemDescription: configs['system.description'] || 'Enterprise knowledge management platform',
      ...booleanUpdates,
      maxFileSize: Number.parseInt(configs['file.upload.max.size'] || '', 10) || 104857600,
      allowedFileTypes: configs['file.upload.allowed.types'] || 'pdf,doc,docx,xlsx,pptx,txt,md,jpg,png,gif',
      loaded: true,
    });
    document.title = `${systemName} | Knowledge Base`;
  } catch {
    set({ loaded: true });
  }
}

export const useAppStore = create<AppState>((set, get) => ({
  systemName: 'Knowledge Base',
  systemDescription: 'Enterprise knowledge management platform',
  requireApproval: true,
  enableComments: true,
  enableAI: true,
  enableAIWriting: true,
  enableFullTextSearch: true,
  enableEmail: true,
  enableWebSocket: true,
  maxFileSize: 104857600,
  allowedFileTypes: 'pdf,doc,docx,xlsx,pptx,txt,md,jpg,png,gif',
  loaded: false,
  fetchAppConfig: async () => {
    if (!get().loaded) await loadConfig(set);
  },
  refreshAppConfig: async () => loadConfig(set),
}));

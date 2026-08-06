export const AI_CONFIG = {
  DEFAULT_MODEL: 'openai',
  MODELS: {
    openai: { key: 'openai', displayName: 'OpenAI 兼容模型', description: '通过 OpenAI 兼容接口接入的模型' },
  },
} as const;

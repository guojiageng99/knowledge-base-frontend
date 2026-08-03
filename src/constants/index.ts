export const AI_CONFIG = {
  DEFAULT_MODEL: 'qwen',
  MODELS: {
    qwen: { key: 'qwen', displayName: '通义千问', description: '阿里云大语言模型' },
    deepseek: { key: 'deepseek', displayName: 'DeepSeek', description: '擅长代码生成和深度推理' },
  },
} as const;

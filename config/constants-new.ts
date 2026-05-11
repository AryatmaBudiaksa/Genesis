import { AIModel, AIProvider, ModelConfig } from '@/types';

// API Configuration
export const API_CONFIG = {
  // Legacy providers (Optional - keep for backward compatibility)
  RESITA_BASE_URL: 'https://api.ferdev.my.id/ai/aicoding',
  RESITA_API_KEY: process.env.RESITA_API_KEY || '',
  NEKOLABS_BASE_URL: 'https://api.netherlabs.my.id',
  NETHERLABS_IMAGE_ANALYSIS_PATH: '/ai/gpt/5',
  THUMBSNAP_API_URL: 'https://thumbsnap.com/api/upload',
  THUMBSNAP_API_KEY: process.env.THUMBSNAP_API_KEY || '',
  
  // LiteLLM Configuration (Primary)
  LITELLM_ENABLED: process.env.LITELLM_ENABLED === 'true' || true,
  
  // OpenAI via LiteLLM
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  
  // Anthropic Claude via LiteLLM
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY || '',
  
  // Google Gemini via LiteLLM
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || 'AIzaSyDkJy0X3ubDf9U3LyatDhPzaa2jmQhflBY',
  GEMINI_MODEL_ID: 'gemini-2.0-flash-exp',
  
  // Cohere via LiteLLM
  COHERE_API_KEY: process.env.COHERE_API_KEY || '',
  
  // OpenRouter API - Supports multiple models
  // Get your API key at: https://openrouter.ai/keys
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY || '',
  OPENROUTER_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'https://chat.fsu.my.id',
  OPENROUTER_SITE_NAME: 'Genesis AI Vision Chatbot',
};

// Image Analysis Models
export const IMAGE_ANALYSIS_MODELS = [
  {
    id: 'gemini-native',
    name: 'Gemini 2.0 Flash (Native)',
    provider: 'google',
    apiType: 'gemini-native',
    modelId: 'gemini-2.0-flash-exp',
    description: 'Google native API - Fast & free',
    free: true,
  },
  {
    id: 'gemini-flash-lite',
    name: 'Gemini Flash Lite (Native)',
    provider: 'google',
    apiType: 'gemini-native',
    modelId: 'gemini-flash-lite-latest',
    description: 'Google native API - Fast & free',
    free: true,
  },
  {
    id: 'gemini-3-flash',
    name: 'Gemini 3 Flash (Native)',
    provider: 'google',
    apiType: 'gemini-native',
    modelId: 'gemini-3-flash-preview',
    description: 'Google native API - Next generation',
    free: true,
  },
  {
    id: 'gemini-openrouter',
    name: 'Gemini 2.0 Flash (OpenRouter)',
    provider: 'google',
    apiType: 'openrouter',
    modelId: 'google/gemini-2.0-flash-exp:free',
    description: 'Via OpenRouter - Free',
    free: true,
  },
];

// Available AI Models Configuration
export const AI_MODELS: Record<AIModel, { name: string; provider: AIProvider; contextWindow: number }> = {
  // LiteLLM - OpenAI Models
  'gpt-4': {
    name: 'GPT-4',
    provider: 'openai',
    contextWindow: 128000,
  },
  'gpt-4-turbo': {
    name: 'GPT-4 Turbo',
    provider: 'openai',
    contextWindow: 128000,
  },
  'gpt-4o': {
    name: 'GPT-4o',
    provider: 'openai',
    contextWindow: 128000,
  },
  'gpt-3.5-turbo': {
    name: 'GPT-3.5 Turbo',
    provider: 'openai',
    contextWindow: 16000,
  },

  // LiteLLM - Anthropic Claude Models
  'claude-3-opus': {
    name: 'Claude 3 Opus',
    provider: 'anthropic',
    contextWindow: 200000,
  },
  'claude-3-sonnet': {
    name: 'Claude 3 Sonnet',
    provider: 'anthropic',
    contextWindow: 200000,
  },
  'claude-3-haiku': {
    name: 'Claude 3 Haiku',
    provider: 'anthropic',
    contextWindow: 200000,
  },
  'claude-2.1': {
    name: 'Claude 2.1',
    provider: 'anthropic',
    contextWindow: 100000,
  },

  // LiteLLM - Google Gemini Models
  'gemini-pro': {
    name: 'Gemini Pro',
    provider: 'google',
    contextWindow: 32768,
  },
  'gemini-2.0-flash-exp': {
    name: 'Gemini 2.0 Flash',
    provider: 'google',
    contextWindow: 1000000,
  },
  'gemini-1.5-pro': {
    name: 'Gemini 1.5 Pro',
    provider: 'google',
    contextWindow: 1000000,
  },
  'gemini-1.5-flash': {
    name: 'Gemini 1.5 Flash',
    provider: 'google',
    contextWindow: 1000000,
  },

  // LiteLLM - Cohere Models
  'command': {
    name: 'Command',
    provider: 'cohere',
    contextWindow: 4096,
  },
  'command-light': {
    name: 'Command Light',
    provider: 'cohere',
    contextWindow: 4096,
  },

  // OpenRouter Models
  'openrouter-gpt-4': {
    name: 'GPT-4 (OpenRouter)',
    provider: 'openrouter',
    contextWindow: 128000,
  },
  'openrouter-claude': {
    name: 'Claude 3 (OpenRouter)',
    provider: 'openrouter',
    contextWindow: 200000,
  },
  'openrouter-gemini': {
    name: 'Gemini (OpenRouter)',
    provider: 'openrouter',
    contextWindow: 32768,
  },

  // Legacy - Resita API Models
  'resita-aicoding': {
    name: 'AI Coding',
    provider: 'resita',
    contextWindow: 128000,
  },
  'resita-claude': {
    name: 'Claude AI',
    provider: 'resita',
    contextWindow: 200000,
  },
  'resita-chatgpt': {
    name: 'ChatGPT 4',
    provider: 'resita',
    contextWindow: 128000,
  },
  'resita-felo': {
    name: 'Felo AI',
    provider: 'resita',
    contextWindow: 32000,
  },
  'resita-gemini': {
    name: 'Gemini',
    provider: 'resita',
    contextWindow: 1000000,
  },
  'resita-gptlogic': {
    name: 'GPT Logic',
    provider: 'resita',
    contextWindow: 32000,
  },
  'resita-venice': {
    name: 'Venice AI',
    provider: 'resita',
    contextWindow: 32000,
  },

  // Legacy - NekoLabs API Models
  'nederlandsgpt4o': {
    name: 'NekoLabs GPT-4o',
    provider: 'netherlabs',
    contextWindow: 128000,
  },
  'nederlandsgpt41': {
    name: 'NekoLabs GPT-4.1',
    provider: 'netherlabs',
    contextWindow: 128000,
  },
  'nederlandsgpt5mini': {
    name: 'NekoLabs GPT-5 Mini',
    provider: 'netherlabs',
    contextWindow: 128000,
  },
  'nederlandsgpt5nano': {
    name: 'NekoLabs GPT-5 Nano',
    provider: 'netherlabs',
    contextWindow: 128000,
  },
};

// Default Model Configuration
export const DEFAULT_MODEL_CONFIG: ModelConfig = {
  id: 'default',
  name: 'Default Configuration',
  provider: 'resita',
  model: 'resita-chatgpt',
  temperature: 0.7,
  maxTokens: 4096,
  topP: 1,
  frequencyPenalty: 0,
  presencePenalty: 0,
  systemPrompt: 'You are a helpful AI assistant with vision capabilities. You can analyze images and provide detailed information about them.',
};

// Model Pricing (per 1K tokens)
export const MODEL_PRICING = {
  // Resita API (Free to use)
  'resita-aicoding': { input: 0, output: 0 },
  'resita-claude': { input: 0, output: 0 },
  'resita-chatgpt': { input: 0, output: 0 },
  'resita-felo': { input: 0, output: 0 },
  'resita-gemini': { input: 0, output: 0 },
  'resita-gptlogic': { input: 0, output: 0 },
  'resita-venice': { input: 0, output: 0 },
};

// Image Analysis Types
export const ANALYSIS_TYPES = [
  { value: 'object-detection', label: 'Object Detection', icon: '🎯' },
  { value: 'label-detection', label: 'Label Detection', icon: '🏷️' },
  { value: 'text-recognition', label: 'Text Recognition (OCR)', icon: '📝' },
  { value: 'face-detection', label: 'Face Detection', icon: '👤' },
  { value: 'landmark-recognition', label: 'Landmark Recognition', icon: '🗺️' },
  { value: 'image-description', label: 'Image Description', icon: '📸' },
  { value: 'visual-qa', label: 'Visual Q&A', icon: '❓' },
] as const;

// File Upload Constraints
export const FILE_UPLOAD_CONFIG = {
  maxSize: 10 * 1024 * 1024, // 10MB
  maxFiles: 5,
  acceptedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  acceptedExtensions: ['.jpg', '.jpeg', '.png', '.webp', '.gif'],
};

// App Constants
export const APP_CONFIG = {
  name: 'AI Vision Chat',
  version: '1.0.0',
  description: 'Intelligent AI Chatbot with Image Analysis',
  maxChatHistory: 100,
  autoSaveInterval: 30000, // 30 seconds
  maxMessageLength: 4000,
  defaultTheme: 'system' as const,
};

// API Endpoints (for future backend integration)
export const API_ENDPOINTS = {
  chat: '/api/chat',
  imageAnalysis: '/api/image-analysis',
  models: '/api/models',
  settings: '/api/settings',
  auth: '/api/auth',
  export: '/api/export',
};

// Local Storage Keys
export const STORAGE_KEYS = {
  chats: 'ai-vision-chats',
  currentChat: 'ai-vision-current-chat',
  modelConfig: 'ai-vision-model-config',
  userPreferences: 'ai-vision-preferences',
  apiKeys: 'ai-vision-api-keys',
  folders: 'ai-vision-folders',
};

// Toast Messages
export const TOAST_MESSAGES = {
  chatSaved: 'Chat saved successfully',
  chatDeleted: 'Chat deleted successfully',
  chatRenamed: 'Chat renamed successfully',
  imageSizeError: 'Image size exceeds maximum limit',
  imageTypeError: 'Invalid image type',
  copySuccess: 'Copied to clipboard',
  exportSuccess: 'Chat exported successfully',
  settingsSaved: 'Settings saved successfully',
  apiKeyInvalid: 'Invalid API key',
  networkError: 'Network error. Please try again.',
};

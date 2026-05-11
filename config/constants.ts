import { AIModel, AIProvider, ModelConfig } from '@/types';

// API Configuration
export const API_CONFIG = {
  // LiteLLM Configuration (Primary)
  LITELLM_ENABLED: process.env.LITELLM_ENABLED === 'true',
  LITELLM_BASE_URL: process.env.LITELLM_BASE_URL || '',
  LITELLM_API_KEY: process.env.LITELLM_API_KEY || '',
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
  // Note: GLM-4.5 Air does not support image input on OpenRouter
  // {
  //   id: 'glm-4.5-air',
  //   name: 'GLM-4.5 Air',
  //   provider: 'zhipu',
  //   apiType: 'openrouter',
  //   modelId: 'z-ai/glm-4.5-air:free',
  //   description: 'Chinese AI model - Free (Text only)',
  //   free: true,
  // }
];

// Available AI Models Configuration
export const AI_MODELS: Record<string, { name: string; provider: AIProvider; contextWindow: number }> = {
  // LiteLLM Models (configured in litellm-config.yaml)
  'gemini-2.0-flash': {
    name: 'Gemini 2.0 Flash',
    provider: 'litellm',
    contextWindow: 1000000,
  },
  'gemini-flash-lite': {
    name: 'Gemini Flash Lite',
    provider: 'litellm',
    contextWindow: 1000000,
  },
};

// Default Model Configuration
export const DEFAULT_MODEL_CONFIG: ModelConfig = {
  id: 'default',
  name: 'Default Configuration',
  provider: 'litellm',
  model: 'gemini-2.0-flash',
  temperature: 0.7,
  maxTokens: 4096,
  topP: 1,
  frequencyPenalty: 0,
  presencePenalty: 0,
  systemPrompt: 'You are a helpful AI assistant with vision capabilities. You can analyze images and provide detailed information about them.',
};

// Model Pricing (per 1K tokens)
export const MODEL_PRICING = {
  'gemini-2.0-flash': { input: 0, output: 0 },
  'gemini-flash-lite': { input: 0, output: 0 },
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
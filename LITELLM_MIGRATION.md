# 🔄 LiteLLM Migration Guide

Panduan lengkap untuk migrate dari multiple providers ke LiteLLM unified interface.

## 📋 Migration Checklist

- [ ] Install LiteLLM package
- [ ] Setup environment variables
- [ ] Update types (AIProvider, AIModel)
- [ ] Update configuration constants
- [ ] Create LiteLLM client library
- [ ] Update API routes
- [ ] Update hooks
- [ ] Update UI components
- [ ] Test all functionality
- [ ] Remove legacy provider code (optional)

## 🔄 Step-by-Step Migration

### Step 1: Install Dependencies

```bash
npm install litellm
# atau
pnpm add litellm
```

### Step 2: Update Environment Variables

**Before (.env.local):**
```
RESITA_API_KEY=...
GEMINI_API_KEY=...
OPENROUTER_API_KEY=...
```

**After (.env.local):**
```
# LiteLLM Configuration
LITELLM_ENABLED=true

# Primary providers
OPENAI_API_KEY=...
ANTHROPIC_API_KEY=...
GEMINI_API_KEY=...
COHERE_API_KEY=...
OPENROUTER_API_KEY=...

# Legacy (optional)
RESITA_API_KEY=...
```

### Step 3: Update Type Definitions

**File:** `/types/index.ts`

**Before:**
```typescript
export type AIProvider = 'resita' | 'nekolabs';
export type AIModel = 
  | 'resita-aicoding'
  | 'resita-claude'
  | 'resita-chatgpt'
  | 'nederolabs-gpt4o';
```

**After:**
```typescript
export type AIProvider = 
  | 'litellm' 
  | 'openai' 
  | 'anthropic' 
  | 'google' 
  | 'cohere' 
  | 'openrouter'
  | 'resita'        // For backward compatibility
  | 'nekolabs';     // For backward compatibility

export type AIModel = 
  | 'gpt-4'
  | 'claude-3-opus'
  | 'gemini-pro'
  | 'command'
  // ... etc
```

### Step 4: Update Configuration

**File:** `/config/constants.ts`

**Before:**
```typescript
export const API_CONFIG = {
  RESITA_BASE_URL: '...',
  RESITA_API_KEY: process.env.RESITA_API_KEY || '',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
};
```

**After:**
```typescript
export const API_CONFIG = {
  LITELLM_ENABLED: process.env.LITELLM_ENABLED === 'true' || true,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY || '',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  COHERE_API_KEY: process.env.COHERE_API_KEY || '',
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY || '',
  // Legacy (for backward compatibility)
  RESITA_API_KEY: process.env.RESITA_API_KEY || '',
};
```

### Step 5: Create LiteLLM Client

**New File:** `/lib/litellm-client.ts`

```typescript
export class LiteLLMClient {
  constructor(config: LiteLLMConfig) { ... }
  async completion(messages: MessageParam[]): Promise<LiteLLMResponse> { ... }
}
```

### Step 6: Update API Routes

**Before (Multiple implementations):**
```typescript
// app/api/chat/route.ts
if (model.startsWith('resita-')) {
  // Resita specific code
} else if (model.startsWith('gemini-')) {
  // Gemini specific code
} else if (model.startsWith('openrouter-')) {
  // OpenRouter specific code
}
```

**After (Unified):**
```typescript
// app/api/chat/litellm-route.ts
const client = new LiteLLMClient({ apiKey, model });
const response = await client.completion(messages);
```

### Step 7: Update Hooks

**Before:**
```typescript
// hooks/useChat.ts
async function sendMessage(msg: string) {
  // Multiple provider-specific logic
}
```

**After:**
```typescript
// hooks/useLiteLLMChat.ts
const { sendMessage } = useLiteLLMChat({ 
  model: 'gpt-4',
  temperature: 0.7 
});

await sendMessage('Hello!');
```

### Step 8: Update UI Components

**File:** `/components/settings/ModelSelector.tsx`

**Before:**
```tsx
const models = [
  { value: 'resita-chatgpt', label: 'ChatGPT 4' },
  { value: 'resita-claude', label: 'Claude AI' },
  { value: 'gemini-3-flash', label: 'Gemini 3 Flash' },
];
```

**After:**
```tsx
const models = [
  { value: 'gpt-4', label: 'GPT-4', category: 'OpenAI' },
  { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo', category: 'OpenAI' },
  { value: 'claude-3-opus', label: 'Claude 3 Opus', category: 'Anthropic' },
  { value: 'claude-3-haiku', label: 'Claude 3 Haiku', category: 'Anthropic' },
  { value: 'gemini-pro', label: 'Gemini Pro', category: 'Google' },
  { value: 'gemini-2.0-flash-exp', label: 'Gemini 2.0 Flash', category: 'Google' },
  { value: 'command', label: 'Command', category: 'Cohere' },
];
```

### Step 9: Update Model Display

**File:** `/lib/model-utils.ts`

```typescript
export function getGroupedModels(): ModelGroup[] {
  return [
    { 
      label: 'OpenAI', 
      models: [
        { key: 'gpt-4' as AIModel, name: 'GPT-4' },
        { key: 'gpt-3.5-turbo' as AIModel, name: 'GPT-3.5 Turbo' },
      ] 
    },
    { 
      label: 'Anthropic', 
      models: [
        { key: 'claude-3-opus' as AIModel, name: 'Claude 3 Opus' },
        { key: 'claude-3-haiku' as AIModel, name: 'Claude 3 Haiku' },
      ] 
    },
    { 
      label: 'Google', 
      models: [
        { key: 'gemini-pro' as AIModel, name: 'Gemini Pro' },
        { key: 'gemini-2.0-flash-exp' as AIModel, name: 'Gemini 2.0 Flash' },
      ] 
    },
  ];
}
```

## 💾 Usage Examples

### Example 1: Update useChat Hook

**Before:**
```typescript
// hooks/useChat.ts
const handleSendMessage = async (content: string) => {
  // Provider-specific logic mixed in
  if (selectedModel.startsWith('resita-')) {
    return callResitaAPI(content);
  } else if (selectedModel.startsWith('gemini-')) {
    return callGeminiAPI(content);
  }
};
```

**After:**
```typescript
// hooks/useChat.ts
import { useLiteLLMChat } from './useLiteLLMChat';

const { sendMessage } = useLiteLLMChat({
  model: selectedModel,
  temperature: 0.7,
});

const handleSendMessage = (content: string) => {
  return sendMessage(content);
};
```

### Example 2: Update Component

**Before:**
```tsx
// components/chat/ChatInput.tsx
const handleSubmit = async () => {
  const response = await fetch('/api/chat', {
    body: JSON.stringify({
      model: selectedModel,
      messages: chatHistory,
      // Provider-specific parameters
      ...(selectedModel.includes('gemini') && {
        generationConfig: { temperature: 0.7 }
      }),
    })
  });
};
```

**After:**
```tsx
// components/chat/ChatInput.tsx
import { useLiteLLMChat } from '@/hooks/useLiteLLMChat';

const { sendMessage, isLoading } = useLiteLLMChat({
  model: selectedModel,
  temperature: 0.7,
  maxTokens: 4096,
});

const handleSubmit = async () => {
  await sendMessage(inputText);
};
```

### Example 3: Update API Route

**Before:**
```typescript
// app/api/chat/route.ts
if (model === 'gemini-3-flash') {
  const response = await fetch('https://generativelanguage.googleapis.com/...', {
    body: JSON.stringify({
      contents: [...],
      generationConfig: { temperature: 0.7 }
    })
  });
} else if (model.startsWith('resita-')) {
  const response = await axios.get(RESITA_URL, {
    params: { prompt, apikey }
  });
}
```

**After:**
```typescript
// app/api/chat/litellm-route.ts
import { LiteLLMClient } from '@/lib/litellm-client';

const client = new LiteLLMClient({
  apiKey: getApiKeyForModel(model),
  model: mapModelName(model),
  temperature: 0.7,
});

const response = await client.completion(messages);
```

## 🔀 Backward Compatibility

Jika ingin maintain support untuk legacy providers:

```typescript
// In API route
if (model.startsWith('resita-')) {
  // Use old Resita API
} else if (model.startsWith('gemini-native')) {
  // Use old Gemini native API
} else {
  // Use LiteLLM for new models
  const client = new LiteLLMClient({ apiKey, model });
  return client.completion(messages);
}
```

## 🧪 Testing Migration

### Test 1: API Endpoint

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role": "user", "content": "Hello"}],
    "model": "gpt-4",
    "temperature": 0.7
  }'
```

### Test 2: Model Switching

```typescript
// Test all providers
const testModels = [
  'gpt-4',
  'claude-3-opus',
  'gemini-pro',
  'command',
];

for (const model of testModels) {
  const response = await sendMessage('Test', { model });
  console.log(`✅ ${model}: ${response.content.substring(0, 50)}...`);
}
```

### Test 3: Error Handling

```typescript
// Test missing API key
process.env.OPENAI_API_KEY = '';

try {
  await sendMessage('Hello', { model: 'gpt-4' });
} catch (error) {
  console.log('✅ Error caught:', error.message);
}
```

### Test 4: Token Counting

```typescript
const response = await sendMessage('Hello');
console.log(`Tokens used: ${response.tokens.total}`);
```

## 📊 Performance Comparison

| Aspect | Before (Multi-Provider) | After (LiteLLM) |
|--------|-------------------------|-----------------|
| Code Lines (API) | 200+ | 50+ |
| Maintainability | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| Adding New Model | Hard | Very Easy |
| Error Handling | Inconsistent | Unified |
| Token Tracking | Manual | Built-in |
| Model Switching | Complex | Simple |

## 🚨 Common Issues & Solutions

### Issue 1: API Key Not Found

```
Error: No API key configured for model: gpt-4
```

**Solution:**
```bash
# Check .env.local
echo $OPENAI_API_KEY

# Set if missing
export OPENAI_API_KEY=sk-...
```

### Issue 2: Invalid Model Name

```
Error: Unsupported model: gpt5
```

**Solution:**
```typescript
// Use correct model name
const response = await sendMessage('Hello', { 
  model: 'gpt-4'  // Not 'gpt5'
});
```

### Issue 3: Rate Limiting

```
Error: 429 - Rate limit exceeded
```

**Solution:**
1. Add exponential backoff
2. Upgrade API plan
3. Use cheaper model (gpt-3.5-turbo)

### Issue 4: Streaming Not Working

```
Error: /api/chat/stream not found
```

**Solution:**
- Streaming is a future enhancement
- Use regular completion for now

## ✅ Post-Migration Checklist

- [ ] All tests pass
- [ ] Environment variables configured
- [ ] Error handling works
- [ ] Token counting accurate
- [ ] Performance acceptable
- [ ] UI displays new models
- [ ] Legacy code removed (optional)
- [ ] Documentation updated
- [ ] Team notified of changes
- [ ] Monitoring setup complete

## 📞 Rollback Plan

Jika ada issues dengan LiteLLM migration:

1. **Keep legacy code** in a separate branch
2. **Add feature flag** untuk switch between old/new
3. **Monitor usage** sebelum fully migrate
4. **Have fallback** ke legacy API

```typescript
const useLiteLLM = process.env.USE_LITELLM === 'true';

if (useLiteLLM) {
  // Use new LiteLLM route
} else {
  // Use legacy route
}
```

## 📚 Resources

- [LiteLLM Docs](https://docs.litellm.ai/)
- [LITELLM_INTEGRATION.md](./LITELLM_INTEGRATION.md) - Full integration guide
- [API Examples](../app/api/chat/litellm-route.ts)
- [Hook Examples](../hooks/useLiteLLMChat.ts)

---

**Migration completed successfully! 🎉**

For issues atau questions, refer ke LITELLM_INTEGRATION.md

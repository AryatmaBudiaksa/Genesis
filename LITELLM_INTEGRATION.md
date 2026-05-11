# 🚀 LiteLLM Integration Guide untuk Genesis

## 📖 Apa itu LiteLLM?

LiteLLM adalah library yang menyediakan unified interface untuk berbagai LLM providers. Dengan LiteLLM, Anda dapat:
- Menggunakan multiple providers dengan single API
- Fallback otomatis jika satu provider down
- Consistent message format di semua provider
- Easy model switching

## ✨ Keuntungan Menggunakan LiteLLM

1. **Unified Interface** - Satu API untuk semua provider
2. **Easy Fallback** - Automatic fallback jika provider gagal
3. **Cost Optimization** - Switch antar provider berdasarkan cost
4. **Better Error Handling** - Consistent error messages
5. **Token Tracking** - Built-in token counting

## 🔧 Setup Instructions

### 1. Install Dependencies

```bash
npm install litellm
# atau jika menggunakan pnpm
pnpm add litellm
```

### 2. Setup Environment Variables

Copy `.env.example` ke `.env.local` dan update dengan API keys:

```bash
# .env.local

# LiteLLM Configuration
LITELLM_ENABLED=true

# OpenAI API Key
OPENAI_API_KEY=sk-...

# Anthropic Claude API Key
ANTHROPIC_API_KEY=sk-ant-...

# Google Gemini API Key
GEMINI_API_KEY=AIzaSy...

# Cohere API Key
COHERE_API_KEY=...

# OpenRouter API Key (optional)
OPENROUTER_API_KEY=sk-or-...
```

### 3. Dapatkan API Keys dari Provider

#### OpenAI
1. Kunjungi: https://platform.openai.com/api-keys
2. Click "Create new secret key"
3. Copy key dan simpan di `OPENAI_API_KEY`

#### Anthropic Claude
1. Kunjungi: https://console.anthropic.com/settings/keys
2. Click "Create Key"
3. Copy key dan simpan di `ANTHROPIC_API_KEY`

#### Google Gemini
1. Kunjungi: https://aistudio.google.com/app/apikey
2. Click "Create API key"
3. Copy key dan simpan di `GEMINI_API_KEY`

#### Cohere
1. Kunjungi: https://dashboard.cohere.ai/api-keys
2. Copy existing key atau create baru
3. Simpan di `COHERE_API_KEY`

#### OpenRouter (Optional - untuk akses multiple models)
1. Kunjungi: https://openrouter.ai/keys
2. Create account dan generate API key
3. Simpan di `OPENROUTER_API_KEY`

## 📝 Available Models

### OpenAI Models
```
- gpt-4              (Most capable, most expensive)
- gpt-4-turbo        (Faster than GPT-4)
- gpt-4o             (Latest GPT-4 vision)
- gpt-3.5-turbo      (Fast and cheap)
```

### Anthropic Claude Models
```
- claude-3-opus      (Most capable)
- claude-3-sonnet    (Balanced performance/cost)
- claude-3-haiku     (Fast and cheap)
- claude-2.1         (Previous version)
```

### Google Gemini Models
```
- gemini-pro         (Standard)
- gemini-2.0-flash-exp  (Latest, experimental)
- gemini-1.5-pro     (Latest production)
- gemini-1.5-flash   (Faster variant)
```

### Cohere Models
```
- command            (Standard)
- command-light      (Lighter variant)
```

### OpenRouter Models (Free alternatives)
```
- openrouter-gpt-4              (GPT-4 free)
- openrouter-claude             (Claude free)
- openrouter-gemini             (Gemini free)
```

## 🔌 Integration Points

### 1. Chat API Route

**New Route:** `/api/chat/litellm-route.ts`

Handles all LLM requests dengan automatic model routing.

**Usage:**

```typescript
const response = await fetch('/api/chat', {
  method: 'POST',
  body: JSON.stringify({
    messages: [
      { role: 'user', content: 'Hello!' }
    ],
    model: 'gpt-4',
    temperature: 0.7,
    maxTokens: 4096,
  })
});
```

### 2. LiteLLM Client Library

**File:** `/lib/litellm-client.ts`

Unified client untuk semua providers:

```typescript
import { LiteLLMClient } from '@/lib/litellm-client';

const client = new LiteLLMClient({
  apiKey: process.env.OPENAI_API_KEY,
  model: 'gpt-4',
  temperature: 0.7,
  maxTokens: 4096,
});

const response = await client.completion([
  { role: 'user', content: 'Hello!' }
]);

console.log(response.content);        // Response text
console.log(response.tokens.total);   // Total tokens used
```

### 3. Configuration

**File:** `/config/constants.ts`

Updated dengan LiteLLM settings:

```typescript
export const API_CONFIG = {
  LITELLM_ENABLED: true,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  // ... dll
};
```

### 4. Type Definitions

**File:** `/types/index.ts`

Updated dengan new providers dan models:

```typescript
export type AIProvider = 
  | 'litellm' 
  | 'openai' 
  | 'anthropic' 
  | 'google' 
  | 'cohere' 
  | 'openrouter'
  | 'resita'
  | 'nekolabs';

export type AIModel = 
  | 'gpt-4'
  | 'claude-3-opus'
  | 'gemini-pro'
  // ... dll
```

## 🚨 Error Handling

### Common Errors dan Solutions

#### 1. "No API key configured"
```
❌ Error: No API key configured for model: gpt-4
✅ Solution: Set OPENAI_API_KEY di .env.local
```

#### 2. "Invalid API key"
```
❌ Error: Invalid API key for OpenAI
✅ Solution: Check API key format dan validity di provider dashboard
```

#### 3. "Model not found"
```
❌ Error: Model gpt-5 not found
✅ Solution: Use valid model names dari list di atas
```

#### 4. "Rate limit exceeded"
```
❌ Error: Rate limit exceeded (429)
✅ Solution: Upgrade plan atau tunggu rate limit reset
```

## 📊 Usage Examples

### Contoh 1: Basic Chat dengan GPT-4

```typescript
// Client side
const response = await fetch('/api/chat', {
  method: 'POST',
  body: JSON.stringify({
    messages: [
      { role: 'system', content: 'You are a helpful assistant.' },
      { role: 'user', content: 'What is 2+2?' }
    ],
    model: 'gpt-4',
    temperature: 0.7,
    maxTokens: 100,
  })
});

const data = await response.json();
console.log(data.message.content); // "2 + 2 equals 4."
```

### Contoh 2: Claude untuk Analysis

```typescript
const response = await fetch('/api/chat', {
  method: 'POST',
  body: JSON.stringify({
    messages: [
      { 
        role: 'user', 
        content: 'Analyze this code for potential bugs:\n\nfunction divide(a, b) {\n  return a / b;\n}' 
      }
    ],
    model: 'claude-3-opus',
    temperature: 0,
    maxTokens: 500,
  })
});
```

### Contoh 3: Gemini untuk Vision

```typescript
const response = await fetch('/api/chat', {
  method: 'POST',
  body: JSON.stringify({
    messages: [
      { role: 'user', content: 'Describe this image: [image_url]' }
    ],
    model: 'gemini-pro-vision',
  })
});
```

### Contoh 4: Fast & Cheap dengan OpenRouter

```typescript
const response = await fetch('/api/chat', {
  method: 'POST',
  body: JSON.stringify({
    messages: [
      { role: 'user', content: 'Hello!' }
    ],
    model: 'openrouter-gpt-4',  // Free GPT-4 alternative
    temperature: 0.7,
  })
});
```

## 🔄 Migration dari Multiple Providers

### Sebelumnya (Multiple Providers)
```typescript
// Gemini
if (model.startsWith('gemini-')) {
  // ... specific Gemini code
}

// Resita
if (model.startsWith('resita-')) {
  // ... specific Resita code
}

// NekoLabs
if (model.startsWith('nekolabs-')) {
  // ... specific NekoLabs code
}
```

### Sesudahnya (LiteLLM)
```typescript
// Single unified route
const client = new LiteLLMClient({ apiKey, model });
const response = await client.completion(messages);
```

## 📈 Cost Optimization

### Rekomendasi Model Selection berdasarkan Use Case

| Use Case | Model | Cost | Speed |
|----------|-------|------|-------|
| Simple chat | gpt-3.5-turbo | Lowest | High |
| Code generation | gpt-4 | High | Medium |
| Analysis | claude-3-opus | Medium | Medium |
| Quick responses | gemini-2.0-flash | Low | Very High |
| Budget-friendly | openrouter-gpt-4:free | Free | Medium |

### Strategi Penghematan Biaya
1. **Use smaller models** untuk simple queries (gpt-3.5-turbo)
2. **Use OpenRouter** untuk free tier models
3. **Implement caching** untuk similar requests
4. **Monitor token usage** dengan built-in tracking
5. **Set appropriate maxTokens** untuk setiap request

## 🧪 Testing

### Test LiteLLM Connection

```typescript
// test-litellm.ts
import { LiteLLMClient } from '@/lib/litellm-client';

async function testLiteLLM() {
  const client = new LiteLLMClient({
    apiKey: process.env.OPENAI_API_KEY!,
    model: 'gpt-4',
  });

  try {
    const response = await client.completion([
      { role: 'user', content: 'Say hello!' }
    ]);
    console.log('✅ Success:', response.content);
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testLiteLLM();
```

## 🐛 Debugging

Enable logging untuk troubleshooting:

```typescript
// In environment atau server code
if (process.env.DEBUG_LITELLM) {
  console.log('LiteLLM Config:', API_CONFIG);
  console.log('Model:', model);
  console.log('API Key present:', !!apiKey);
}
```

## 📚 Useful Links

- [LiteLLM Documentation](https://docs.litellm.ai/)
- [OpenAI Documentation](https://platform.openai.com/docs)
- [Anthropic Claude Documentation](https://docs.anthropic.com)
- [Google Gemini Documentation](https://ai.google.dev/docs)
- [Cohere Documentation](https://docs.cohere.ai/)
- [OpenRouter Documentation](https://openrouter.ai/docs)

## ✅ Next Steps

1. ✅ Install LiteLLM package
2. ✅ Setup environment variables
3. ✅ Test API connection
4. ✅ Update UI to use new models
5. ✅ Monitor usage dan costs
6. ✅ Optimize model selection

## 💡 Tips & Tricks

### 1. Quick Model Switching
```typescript
// Easy to change models
client.setModel('claude-3-opus');  // Switch to Claude
client.setModel('gpt-4');          // Switch back to GPT-4
```

### 2. Token Counting
```typescript
const response = await client.completion(messages);
console.log(`Used ${response.tokens.total} tokens`);
```

### 3. Fallback Strategy
```typescript
// Try primary model, fallback to cheaper alternative
const models = ['gpt-4', 'gpt-3.5-turbo'];
for (const model of models) {
  try {
    return await callLiteLLM(model);
  } catch (error) {
    console.log(`${model} failed, trying next...`);
  }
}
```

## 📞 Support

Jika ada masalah atau pertanyaan:
1. Check error messages dan dokumentasi di atas
2. Verify API keys di provider dashboard
3. Check network connectivity
4. Review console logs untuk debugging info
5. Contact provider support jika API-specific error

---

**Last Updated:** May 2024  
**Version:** 1.0.0

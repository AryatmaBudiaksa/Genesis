# 📌 LiteLLM Quick Reference

## 🚀 Quick Start (5 menit)

### 1. Install
```bash
pnpm add litellm
```

### 2. Set Environment Variables
```env
LITELLM_ENABLED=true
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GEMINI_API_KEY=AIzaSy...
```

### 3. Use in Code
```typescript
import { useLiteLLMChat } from '@/hooks/useLiteLLMChat';

const { sendMessage } = useLiteLLMChat({ model: 'gpt-4' });
await sendMessage('Hello!');
```

---

## 📋 Available Models

### OpenAI (Best for everything)
| Model | Cost | Speed | Use Case |
|-------|------|-------|----------|
| gpt-4 | $$$ | Medium | Reasoning, code |
| gpt-4-turbo | $$ | Fast | General purpose |
| gpt-4o | $$ | Fast | Vision tasks |
| gpt-3.5-turbo | $ | Very Fast | Simple tasks |

### Anthropic Claude (Best for analysis)
| Model | Cost | Speed | Use Case |
|-------|------|-------|----------|
| claude-3-opus | $$ | Medium | Complex analysis |
| claude-3-sonnet | $ | Fast | Balanced |
| claude-3-haiku | $ | Very Fast | Simple |

### Google Gemini (Best for vision)
| Model | Cost | Speed | Use Case |
|-------|------|-------|----------|
| gemini-pro | Free | Fast | Chat, coding |
| gemini-2.0-flash-exp | Free | Very Fast | Latest |
| gemini-1.5-pro | $ | Medium | Vision, long context |

### Cohere (Budget-friendly)
| Model | Cost | Speed |
|-------|------|-------|
| command | $ | Medium |
| command-light | $ | Fast |

### OpenRouter (Free alternatives)
| Model | Cost | Speed |
|-------|------|-------|
| openrouter-gpt-4 | Free | Medium |
| openrouter-claude | Free | Medium |
| openrouter-gemini | Free | Fast |

---

## 💻 Code Examples

### Basic Chat
```typescript
const { sendMessage, isLoading } = useLiteLLMChat({ 
  model: 'gpt-4' 
});

const response = await sendMessage('What is 2+2?');
console.log(response.content); // "4"
```

### With Options
```typescript
const response = await sendMessage('Summarize this...', {
  temperature: 0,           // Deterministic
  maxTokens: 500,          // Short response
  model: 'claude-3-opus',  // Override default
});
```

### Quick Completion
```typescript
const { complete } = useQuickCompletion();
const result = await complete('Hello!', { 
  model: 'gpt-3.5-turbo' 
});
```

### API Route
```typescript
const response = await fetch('/api/chat', {
  method: 'POST',
  body: JSON.stringify({
    messages: [{ role: 'user', content: 'Hi' }],
    model: 'gpt-4',
    temperature: 0.7,
  })
});
```

---

## 🔧 Configuration

### Default Options
```typescript
const { sendMessage } = useLiteLLMChat({
  model: 'gpt-4',                    // Required
  temperature: 0.7,                  // 0-2
  maxTokens: 4096,                   // Max output
  topP: 0.9,                         // Diversity
  frequencyPenalty: 0,               // Repetition
  presencePenalty: 0,                // Topic variety
});
```

### Environment Variables
```env
# LiteLLM Settings
LITELLM_ENABLED=true

# API Keys
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GEMINI_API_KEY=AIzaSy...
COHERE_API_KEY=...
OPENROUTER_API_KEY=sk-or-...
```

---

## 🎯 Model Selection Guide

```
┌─────────────────────────────────────────┐
│ What do you need?                       │
└─────────────────────────────────────────┘
         ↓
  ┌──────────────────────────────────────┐
  │ ┌─────────────┐  ┌────────────┐    │
  │ │ Cheap/Fast  │  │ Expensive  │    │
  │ └─────────────┘  └────────────┘    │
  └───┬───────────────────────────┬──────┘
      ↓                           ↓
  ┌──────────────────┐    ┌─────────────────┐
  │ • gpt-3.5-turbo  │    │ • gpt-4         │
  │ • gemini-pro     │    │ • claude-opus   │
  │ • command-light  │    │ • gpt-4o        │
  └──────────────────┘    └─────────────────┘
```

---

## 🔄 Model Switching

```typescript
// Change model anytime
const client = new LiteLLMClient({ apiKey, model: 'gpt-4' });
client.setModel('claude-3-opus');  // Switch
client.setModel('gemini-pro');     // Switch again
```

---

## 📊 Token Usage

```typescript
const response = await sendMessage('Hello');

console.log(response.tokens.prompt);      // Input tokens
console.log(response.tokens.completion);  // Output tokens
console.log(response.tokens.total);       // Total tokens
```

---

## 🚨 Error Handling

```typescript
try {
  await sendMessage('Hello', { model: 'gpt-4' });
} catch (error) {
  if (error.message.includes('API key')) {
    // Setup API key
  } else if (error.message.includes('Rate limit')) {
    // Wait and retry
  } else {
    // Generic error
  }
}
```

---

## 💰 Cost Comparison (per 1M tokens)

| Model | Input | Output |
|-------|-------|--------|
| gpt-3.5-turbo | $0.50 | $1.50 |
| gpt-4 | $30 | $60 |
| gpt-4-turbo | $10 | $30 |
| claude-3-haiku | $0.25 | $1.25 |
| claude-3-sonnet | $3 | $15 |
| claude-3-opus | $15 | $75 |
| gemini-pro | Free | Free |
| command | $2 | $10 |

---

## 🔗 Important Links

| Resource | URL |
|----------|-----|
| LiteLLM Docs | https://docs.litellm.ai/ |
| OpenAI Keys | https://platform.openai.com/api-keys |
| Claude Keys | https://console.anthropic.com/ |
| Gemini Keys | https://aistudio.google.com/app/apikey |
| Cohere Dashboard | https://dashboard.cohere.ai/ |
| OpenRouter | https://openrouter.ai/ |

---

## 🎓 File Structure

```
Genesis/
├── lib/
│   └── litellm-client.ts           ← Main client
├── hooks/
│   └── useLiteLLMChat.ts           ← React hooks
├── app/api/
│   └── chat/
│       └── litellm-route.ts        ← API endpoint
├── config/
│   └── constants.ts                ← Configuration
├── types/
│   └── index.ts                    ← Type definitions
├── LITELLM_INTEGRATION.md          ← Full guide
├── LITELLM_MIGRATION.md            ← Migration guide
└── LITELLM_QUICKREF.md             ← This file
```

---

## ✅ Verification Checklist

- [ ] pnpm install litellm
- [ ] .env.local updated with API keys
- [ ] LITELLM_ENABLED=true
- [ ] /api/chat endpoint working
- [ ] useLiteLLMChat hook working
- [ ] All models tested
- [ ] Error handling working
- [ ] Token counting correct

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| No API key error | Set OPENAI_API_KEY etc in .env.local |
| Invalid model | Use correct model name from list |
| Rate limit | Upgrade plan or use cheaper model |
| Slow response | Use faster model (gpt-3.5-turbo) |
| High cost | Switch to cheaper provider |

---

## 💡 Pro Tips

1. **Use gpt-3.5-turbo** for 80% of tasks (cheapest)
2. **Cache common requests** to save tokens
3. **Set appropriate maxTokens** to avoid waste
4. **Use temperature=0** for deterministic responses
5. **Monitor token usage** with built-in tracking
6. **Try OpenRouter** for free tier models
7. **Implement fallback** for better reliability

---

## 🚀 Next Steps

1. ✅ Read [LITELLM_INTEGRATION.md](./LITELLM_INTEGRATION.md)
2. ✅ Follow [LITELLM_MIGRATION.md](./LITELLM_MIGRATION.md)
3. ✅ Test with examples
4. ✅ Integrate into your app
5. ✅ Monitor usage and costs

---

**Last Updated:** May 2024  
**Version:** 1.0.0

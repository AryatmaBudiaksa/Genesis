/**
 * LiteLLM Unified Client for all LLM providers
 * Consolidates calls to multiple providers through a single interface
 */

interface LiteLLMConfig {
  apiKey: string;
  model: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
}

interface MessageParam {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface LiteLLMResponse {
  content: string;
  tokens: {
    prompt: number;
    completion: number;
    total: number;
  };
  model: string;
}

/**
 * LiteLLM Client untuk komunikasi dengan berbagai LLM providers
 * Supported models:
 * - OpenAI: gpt-4, gpt-4-turbo, gpt-3.5-turbo
 * - Anthropic: claude-3-opus, claude-3-sonnet, claude-3-haiku
 * - Google: gemini-pro, gemini-1.5-pro
 * - Cohere: command, command-light
 * - OpenRouter: any model available on OpenRouter
 */
export class LiteLLMClient {
  private config: LiteLLMConfig;

  constructor(config: LiteLLMConfig) {
    this.config = {
      temperature: 0.7,
      maxTokens: 4096,
      topP: 0.9,
      frequencyPenalty: 0,
      presencePenalty: 0,
      ...config,
    };
  }

  /**
   * Call LiteLLM API with messages
   */
  async completion(messages: MessageParam[]): Promise<LiteLLMResponse> {
    try {
      // Note: This is a wrapper approach since litellm is primarily a Python package
      // For Node.js, we use a REST API approach to litellm server
      // or directly call the provider APIs through litellm mapping

      const response = await this.callProvider(messages);
      return response;
    } catch (error) {
      throw new Error(`LiteLLM completion error: ${error}`);
    }
  }

  /**
   * Route to appropriate provider based on model name
   */
  private async callProvider(messages: MessageParam[]): Promise<LiteLLMResponse> {
    const model = this.config.model;

    // Route to appropriate provider
    if (model.startsWith('gpt-')) {
      return this.callOpenAI(messages);
    } else if (model.startsWith('claude-')) {
      return this.callAnthropic(messages);
    } else if (model.startsWith('gemini-')) {
      return this.callGemini(messages);
    } else if (model.startsWith('command')) {
      return this.callCohere(messages);
    } else if (model.includes('openrouter')) {
      return this.callOpenRouter(messages);
    } else {
      throw new Error(`Unsupported model: ${model}`);
    }
  }

  /**
   * OpenAI API call
   */
  private async callOpenAI(messages: MessageParam[]): Promise<LiteLLMResponse> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.config.model,
        messages,
        temperature: this.config.temperature,
        max_tokens: this.config.maxTokens,
        top_p: this.config.topP,
        frequency_penalty: this.config.frequencyPenalty,
        presence_penalty: this.config.presencePenalty,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI API error: ${error.error.message}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    const usage = data.usage;

    return {
      content,
      tokens: {
        prompt: usage.prompt_tokens,
        completion: usage.completion_tokens,
        total: usage.total_tokens,
      },
      model: data.model,
    };
  }

  /**
   * Anthropic Claude API call
   */
  private async callAnthropic(messages: MessageParam[]): Promise<LiteLLMResponse> {
    // Extract system message if present
    const systemMessage = messages.find((m) => m.role === 'system')?.content || '';
    const userMessages = messages.filter((m) => m.role !== 'system');

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': this.config.apiKey,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: this.config.model,
        max_tokens: this.config.maxTokens,
        system: systemMessage,
        messages: userMessages,
        temperature: this.config.temperature,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Anthropic API error: ${error.error.message}`);
    }

    const data = await response.json();
    const content = data.content[0].text;

    return {
      content,
      tokens: {
        prompt: data.usage.input_tokens,
        completion: data.usage.output_tokens,
        total: data.usage.input_tokens + data.usage.output_tokens,
      },
      model: data.model,
    };
  }

  /**
   * Google Gemini API call
   */
  private async callGemini(messages: MessageParam[]): Promise<LiteLLMResponse> {
    const prompt = messages.map((m) => `${m.role}: ${m.content}`).join('\n');

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${this.config.model}:generateContent?key=${this.config.apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: this.config.temperature,
            maxOutputTokens: this.config.maxTokens,
            topP: this.config.topP,
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Gemini API error: ${error.error.message}`);
    }

    const data = await response.json();
    const content = data.candidates[0].content.parts[0].text;

    // Estimate tokens
    const estimatedTokens = Math.ceil(content.length / 4);

    return {
      content,
      tokens: {
        prompt: Math.ceil(prompt.length / 4),
        completion: estimatedTokens,
        total: Math.ceil((prompt.length + content.length) / 4),
      },
      model: this.config.model,
    };
  }

  /**
   * Cohere API call
   */
  private async callCohere(messages: MessageParam[]): Promise<LiteLLMResponse> {
    const prompt = messages.map((m) => `${m.role}: ${m.content}`).join('\n');

    const response = await fetch('https://api.cohere.ai/v1/generate', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.config.model,
        prompt,
        max_tokens: this.config.maxTokens,
        temperature: this.config.temperature,
        p: this.config.topP,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Cohere API error: ${error.message}`);
    }

    const data = await response.json();
    const content = data.generations[0].text;

    return {
      content,
      tokens: {
        prompt: Math.ceil(prompt.length / 4),
        completion: Math.ceil(content.length / 4),
        total: Math.ceil((prompt.length + content.length) / 4),
      },
      model: this.config.model,
    };
  }

  /**
   * OpenRouter API call (untuk akses ke berbagai model)
   */
  private async callOpenRouter(messages: MessageParam[]): Promise<LiteLLMResponse> {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.config.apiKey}`,
        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'https://localhost:3000',
        'X-Title': 'Genesis AI Vision',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.config.model,
        messages,
        temperature: this.config.temperature,
        max_tokens: this.config.maxTokens,
        top_p: this.config.topP,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenRouter API error: ${error.error.message}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    const usage = data.usage;

    return {
      content,
      tokens: {
        prompt: usage.prompt_tokens,
        completion: usage.completion_tokens,
        total: usage.total_tokens,
      },
      model: data.model,
    };
  }

  /**
   * Set new model
   */
  setModel(model: string): void {
    this.config.model = model;
  }

  /**
   * Get current configuration
   */
  getConfig(): LiteLLMConfig {
    return { ...this.config };
  }
}

/**
 * Factory function untuk membuat LiteLLM client
 */
export function createLiteLLMClient(config: LiteLLMConfig): LiteLLMClient {
  return new LiteLLMClient(config);
}

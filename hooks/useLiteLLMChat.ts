/**
 * Hook untuk menggunakan LiteLLM Chat API
 * Menyediakan unified interface untuk semua LLM providers
 */

import { useState, useCallback } from 'react';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
}

export interface ChatResponse {
  content: string;
  tokens: {
    prompt: number;
    completion: number;
    total: number;
  };
  model: string;
}

export interface UseLiteLLMChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  lastResponse: ChatResponse | null;
  totalTokensUsed: number;
}

/**
 * Hook untuk LiteLLM Chat dengan automatic API routing
 * 
 * @example
 * const { messages, isLoading, sendMessage } = useLiteLLMChat({
 *   model: 'gpt-4',
 *   temperature: 0.7,
 * });
 * 
 * await sendMessage('Hello!');
 */
export function useLiteLLMChat(defaultOptions: ChatOptions = {}) {
  const [state, setState] = useState<UseLiteLLMChatState>({
    messages: [],
    isLoading: false,
    error: null,
    lastResponse: null,
    totalTokensUsed: 0,
  });

  /**
   * Send message to LiteLLM API
   */
  const sendMessage = useCallback(
    async (userMessage: string, options?: ChatOptions) => {
      const mergedOptions = { ...defaultOptions, ...options };

      try {
        // Reset error state
        setState((prev) => ({ ...prev, error: null }));

        // Validate inputs
        if (!userMessage.trim()) {
          throw new Error('Message cannot be empty');
        }

        if (!mergedOptions.model) {
          throw new Error('Model not specified');
        }

        // Add user message to history
        const newMessages: ChatMessage[] = [
          ...state.messages,
          { role: 'user', content: userMessage },
        ];

        setState((prev) => ({
          ...prev,
          messages: newMessages,
          isLoading: true,
        }));

        // Call LiteLLM API
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: newMessages,
            model: mergedOptions.model,
            temperature: mergedOptions.temperature ?? 0.7,
            maxTokens: mergedOptions.maxTokens ?? 4096,
            topP: mergedOptions.topP ?? 0.9,
            frequencyPenalty: mergedOptions.frequencyPenalty ?? 0,
            presencePenalty: mergedOptions.presencePenalty ?? 0,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `API error: ${response.statusText}`);
        }

        const data = await response.json();
        const chatResponse: ChatResponse = {
          content: data.message.content,
          tokens: {
            prompt: data.usage.promptTokens,
            completion: data.usage.completionTokens,
            total: data.usage.totalTokens,
          },
          model: data.model,
        };

        // Add assistant message to history
        const updatedMessages: ChatMessage[] = [
          ...newMessages,
          { role: 'assistant', content: chatResponse.content },
        ];

        setState((prev) => ({
          ...prev,
          messages: updatedMessages,
          isLoading: false,
          lastResponse: chatResponse,
          totalTokensUsed: prev.totalTokensUsed + chatResponse.tokens.total,
        }));

        return chatResponse;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }));

        throw error;
      }
    },
    [state.messages, defaultOptions]
  );

  /**
   * Clear all messages
   */
  const clearMessages = useCallback(() => {
    setState({
      messages: [],
      isLoading: false,
      error: null,
      lastResponse: null,
      totalTokensUsed: 0,
    });
  }, []);

  /**
   * Add system message
   */
  const setSystemMessage = useCallback((content: string) => {
    setState((prev) => {
      // Remove existing system message if any
      const messagesWithoutSystem = prev.messages.filter((m) => m.role !== 'system');

      return {
        ...prev,
        messages: [{ role: 'system', content }, ...messagesWithoutSystem],
      };
    });
  }, []);

  /**
   * Remove last message
   */
  const removeLastMessage = useCallback(() => {
    setState((prev) => ({
      ...prev,
      messages: prev.messages.slice(0, -1),
    }));
  }, []);

  /**
   * Get chat summary statistics
   */
  const getStats = useCallback(() => ({
    messageCount: state.messages.length,
    totalTokens: state.totalTokensUsed,
    lastModelUsed: state.lastResponse?.model,
  }), [state.messages.length, state.totalTokensUsed, state.lastResponse?.model]);

  return {
    ...state,
    sendMessage,
    clearMessages,
    setSystemMessage,
    removeLastMessage,
    getStats,
  };
}

/**
 * Hook untuk quick single completion requests (tidak menyimpan history)
 * 
 * @example
 * const { complete, isLoading } = useQuickCompletion();
 * const response = await complete('What is 2+2?', { model: 'gpt-4' });
 */
export function useQuickCompletion() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const complete = useCallback(
    async (prompt: string, options: ChatOptions = {}): Promise<ChatResponse | null> => {
      try {
        setIsLoading(true);
        setError(null);

        if (!prompt.trim()) {
          throw new Error('Prompt cannot be empty');
        }

        if (!options.model) {
          throw new Error('Model not specified');
        }

        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: [{ role: 'user', content: prompt }],
            model: options.model,
            temperature: options.temperature ?? 0.7,
            maxTokens: options.maxTokens ?? 4096,
            topP: options.topP ?? 0.9,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `API error: ${response.statusText}`);
        }

        const data = await response.json();

        const result: ChatResponse = {
          content: data.message.content,
          tokens: {
            prompt: data.usage.promptTokens,
            completion: data.usage.completionTokens,
            total: data.usage.totalTokens,
          },
          model: data.model,
        };

        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return { complete, isLoading, error };
}

/**
 * Hook untuk streaming responses (buat future enhancement)
 * 
 * @example
 * const { stream, isLoading } = useStreamCompletion();
 * await stream('Tell me a story', (chunk) => {
 *   console.log('Streamed:', chunk);
 * }, { model: 'gpt-4' });
 */
export function useStreamCompletion() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stream = useCallback(
    async (
      prompt: string,
      onChunk: (chunk: string) => void,
      options: ChatOptions = {}
    ): Promise<void> => {
      try {
        setIsLoading(true);
        setError(null);

        if (!prompt.trim()) {
          throw new Error('Prompt cannot be empty');
        }

        if (!options.model) {
          throw new Error('Model not specified');
        }

        const response = await fetch('/api/chat/stream', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: [{ role: 'user', content: prompt }],
            model: options.model,
            temperature: options.temperature ?? 0.7,
            maxTokens: options.maxTokens ?? 4096,
          }),
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.statusText}`);
        }

        if (!response.body) {
          throw new Error('Response body is empty');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();

          if (done) break;

          const chunk = decoder.decode(value);
          onChunk(chunk);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return { stream, isLoading, error };
}

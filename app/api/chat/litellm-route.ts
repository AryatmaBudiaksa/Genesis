/**
 * Unified Chat API Route using LiteLLM
 * Consolidates all LLM providers through a single interface
 */

import { NextRequest, NextResponse } from 'next/server';
import { LiteLLMClient } from '@/litellm-client';
import { API_CONFIG } from '@/config/constants';

interface ChatRequest {
  messages: Array<{ role: string; content: string }>;
  model: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
}

export async function POST(req: NextRequest) {
  try {
    const data: ChatRequest = await req.json();

    const {
      messages,
      model,
      temperature = 0.7,
      maxTokens = 4096,
      topP = 0.9,
      frequencyPenalty = 0,
      presencePenalty = 0,
    } = data;

    // Validate inputs
    if (!messages || messages.length === 0) {
      return NextResponse.json(
        { error: 'No messages provided' },
        { status: 400 }
      );
    }

    if (!model) {
      return NextResponse.json(
        { error: 'No model specified' },
        { status: 400 }
      );
    }

    // Check if LiteLLM is enabled
    if (!API_CONFIG.LITELLM_ENABLED) {
      return NextResponse.json(
        { error: 'LiteLLM is not enabled. Set LITELLM_ENABLED=true in environment variables.' },
        { status: 503 }
      );
    }

    // Gunakan LITELLM_API_KEY — provider API key diatur di litellm-config.yaml
    const litellmClient = new LiteLLMClient({
      apiKey: API_CONFIG.LITELLM_API_KEY,
      model,
      temperature,
      maxTokens,
      topP,
      frequencyPenalty,
      presencePenalty,
    });

    // Call LiteLLM
    const response = await litellmClient.completion(
      messages.map((msg) => ({
        role: msg.role as 'user' | 'assistant' | 'system',
        content: msg.content,
      }))
    );

    return NextResponse.json({
      message: {
        role: 'assistant',
        content: response.content,
        tokens: response.tokens.completion,
      },
      usage: {
        promptTokens: response.tokens.prompt,
        completionTokens: response.tokens.completion,
        totalTokens: response.tokens.total,
      },
      model: response.model,
    });

  } catch (error: any) {
    console.error('LiteLLM Chat API error:', error);

    return NextResponse.json(
      {
        error: error.message || 'Failed to process chat request',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: error.status || 500 }
    );
  }
}
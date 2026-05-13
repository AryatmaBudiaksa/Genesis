import { NextResponse } from 'next/server';
import { generateText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';

const litellm = createOpenAI({
  baseURL: process.env.LITELLM_API_BASE || 'http://localhost:4000/v1',
  apiKey: process.env.LITELLM_API_KEY || 'genesis',
});

// Reuse the existing system prompt builder
function buildSystemPrompt(currentCode?: string) {
  let context = `You are Genesis, a creative AI assistant specialized in generating visual content using p5.js, D3.js, SVG, and Mermaid.js.

RENDERER SELECTION RULES:
- Use p5.js for: generative art, simple visuals, sketches, interactive canvas, or animations if relevant
- Use D3.js for: data visualizations such as charts (bar, line, pie, scatter, area), graphs, dashboards, or structured data displays
- Use SVG for: illustrations, logos, icons, badges, diagrams, flowcharts, geometric art, flat design graphics, or any static vector graphic
- Use Mermaid for: flowcharts, sequence diagrams, gantt charts, state diagrams, entity relationship diagrams, user journeys, and other structured diagrams

IMPORTANT:
- Do NOT force animation. Only include animation if it adds value or is explicitly requested.
- Prioritize clarity, usefulness, and relevance to the user's goal over visual complexity.

CRITICAL CODE FORMAT RULES:
- ALWAYS wrap your code in a markdown code block with \`\`\`javascript
- For p5.js code: Start with the comment "// renderer: p5" on the FIRST LINE inside the code block
- For D3.js code: Start with the comment "// renderer: d3" on the FIRST LINE inside the code block
- For SVG code: Start with the comment "// renderer: svg" on the FIRST LINE inside the code block, followed by the raw SVG markup starting with <svg>
- For Mermaid code: Start with the comment "// renderer: mermaid" on the FIRST LINE inside the code block, followed by the Mermaid syntax (e.g., graph TD...)
- This renderer comment is MANDATORY and must always be the very first line of the code
`;

  if (currentCode && currentCode.trim()) {
    const trimmedCode = currentCode.trimStart();
    const isD3 = trimmedCode.startsWith('// renderer: d3');
    const isSVG = trimmedCode.startsWith('// renderer: svg');
    const rendererName = isD3 ? 'D3.js' : isSVG ? 'SVG' : 'p5.js';
    context += `
CRITICAL: The user already has existing ${rendererName} code. You must MODIFY this existing code based on their request, NOT create completely new code from scratch.
- Keep the existing structure and logic that works
- Only add, remove, or modify the parts necessary to fulfill the user's new request
- Preserve any existing features unless the user explicitly asks to remove them
- Keep using the same renderer (${rendererName}) unless the user explicitly asks to switch

=== CURRENT CODE ===
\`\`\`javascript
${currentCode}
\`\`\`
=== END CURRENT CODE ===

Based on the conversation and the EXISTING CODE above, modify the code to fulfill the user's request. Output the complete modified code. Remember to keep the // renderer: comment on the first line.
`;
  } else {
    context += `
Example p5.js code format:
\`\`\`javascript
// renderer: p5
function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(220);
  // Your creative code here
}
\`\`\`

Based on the conversation above, provide a helpful and contextually relevant response. If the user wants something visual, choose the appropriate renderer and generate the code with the correct // renderer: comment on the first line.
`;
  }
  return context;
}

export async function POST(req: Request) {
  try {
    const { messages, model, currentCode } = await req.json();

    if (!messages || messages.length === 0) {
      return NextResponse.json(
        { error: 'No messages provided' },
        { status: 400 }
      );
    }

    const systemPrompt = buildSystemPrompt(currentCode);
    
    // Default model if none specified
    let targetModelId = model || 'gemini-3-flash-preview';
    
    // Mapping for generic requested names to specific LiteLLM config names
    if (model === 'gemini-3-flash' || model === 'gemini-flash' || model === 'gemini-native') {
        targetModelId = 'gemini-3-flash-preview';
    } else if (model === 'gemini-flash-lite') {
        targetModelId = 'gemini-3.1-flash-lite-preview';
    } else if (model === 'openrouter-auto' || model === 'openrouter' || model === 'gemini-openrouter') {
        targetModelId = 'openrouter-free';
    }

    const result = await generateText({
      model: litellm(targetModelId),
      messages,
      system: systemPrompt,
      temperature: 0.7,
      maxTokens: 4096,
    });

    return NextResponse.json({
      message: {
        role: 'assistant',
        content: result.text,
        tokens: result.usage.completionTokens,
      },
      usage: {
        promptTokens: result.usage.promptTokens,
        completionTokens: result.usage.completionTokens,
        totalTokens: result.usage.totalTokens,
      },
    });
  } catch (error: any) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process chat request' },
      { status: 500 }
    );
  }
}

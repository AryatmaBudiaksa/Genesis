import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { API_CONFIG } from '@/config/constants';

export async function POST(req: Request) {
  try {
    const { messages, model, currentCode } = await req.json();

    if (!messages || messages.length === 0) {
      return NextResponse.json(
        { error: 'No messages provided' },
        { status: 400 }
      );
    }

    // Build conversation context from all messages
    let conversationContext = `You are Genesis, a creative AI assistant specialized in generating visual content using p5.js, D3.js, and SVG.

RENDERER SELECTION RULES:
- Use p5.js for: generative art, simple visuals, sketches, interactive canvas, or animations if relevant
- Use D3.js for: data visualizations such as charts (bar, line, pie, scatter, area), graphs, dashboards, or structured data displays
- Use SVG for: illustrations, logos, icons, badges, diagrams, flowcharts, geometric art, flat design graphics, or any static vector graphic

IMPORTANT:
- Do NOT force animation. Only include animation if it adds value or is explicitly requested.
- Prioritize clarity, usefulness, and relevance to the user's goal over visual complexity.

CRITICAL CODE FORMAT RULES:
- ALWAYS wrap your code in a markdown code block with \`\`\`javascript
- For p5.js code: Start with the comment "// renderer: p5" on the FIRST LINE inside the code block
- For D3.js code: Start with the comment "// renderer: d3" on the FIRST LINE inside the code block
- For SVG code: Start with the comment "// renderer: svg" on the FIRST LINE inside the code block, followed by the raw SVG markup starting with <svg>
- This renderer comment is MANDATORY and must always be the very first line of the code

p5.js RULES:
- Must include setup() and draw() functions
- Use createCanvas(400, 400) in setup() unless specified otherwise
- Visuals can be static or animated depending on user needs
- Keep visuals clean and purposeful, not overly complex

D3.js RULES:
- Always select '#chart' as the root container: d3.select('#chart')
- Use const width = window.innerWidth and const height = window.innerHeight for responsive sizing
- Generate realistic sample/mock data if none is provided
- Follow margin convention: { top: 40, right: 30, bottom: 50, left: 60 }
- Include axes, labels, and legends when useful
- Add transitions ONLY if they improve readability or user experience
- Use clean and professional color scales (e.g., d3.schemeTableau10)

SVG RULES:
- Output raw SVG markup (starting with <svg>) after the // renderer: svg comment
- Always include viewBox attribute for responsive scaling (e.g., viewBox="0 0 400 400")
- Use meaningful fill and stroke colors — avoid plain black-on-white unless intentional
- Use clean shapes: <rect>, <circle>, <ellipse>, <path>, <polygon>, <line>, <text>, <g>
- Group related elements with <g> and use transform for positioning
- Add descriptive comments inside the SVG where useful
- Keep the design clean, modern, and visually appealing
- Use gradients (<linearGradient>, <radialGradient>) and filters for premium look when appropriate

GENERAL RULES:
- Add comments to explain the code
- Focus on delivering visuals that match the user's intent
- If the user asks a non-visual question, respond normally without code
`;

    // If there's existing code, instruct AI to modify it
    if (currentCode && currentCode.trim()) {
      // Detect which renderer the existing code uses
      const trimmedCode = currentCode.trimStart();
      const isD3 = trimmedCode.startsWith('// renderer: d3');
      const isSVG = trimmedCode.startsWith('// renderer: svg');
      const rendererName = isD3 ? 'D3.js' : isSVG ? 'SVG' : 'p5.js';
      conversationContext += `
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

`;
    } else {
      conversationContext += `
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

Example D3.js code format:
\`\`\`javascript
// renderer: d3
const width = window.innerWidth;
const height = window.innerHeight;
const margin = { top: 40, right: 30, bottom: 50, left: 60 };

const data = [
  { label: 'A', value: 30 },
  { label: 'B', value: 80 },
  { label: 'C', value: 45 },
];

const svg = d3.select('#chart')
  .append('svg')
  .attr('width', width)
  .attr('height', height);

// Build your visualization here
\`\`\`

Example SVG code format:
\`\`\`javascript
// renderer: svg
<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
  <!-- Your SVG illustration here -->
  <rect x="50" y="50" width="300" height="300" rx="20" fill="#6366f1" />
  <circle cx="200" cy="200" r="80" fill="#f59e0b" />
  <text x="200" y="210" text-anchor="middle" fill="white" font-size="24" font-family="sans-serif">Hello</text>
</svg>
\`\`\`

`;
    }

    conversationContext += `Continue the conversation naturally based on the chat history below.

=== Chat History ===
`;

    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i];
      if (msg.role === 'user') {
        conversationContext += `User: ${msg.content}\n`;
      } else if (msg.role === 'assistant') {
        conversationContext += `Assistant: ${msg.content}\n`;
      }
    }

    conversationContext += '\n=== Instructions ===\n';
    if (currentCode && currentCode.trim()) {
      conversationContext += 'Based on the conversation and the EXISTING CODE above, modify the code to fulfill the user\'s request. Output the complete modified code. Remember to keep the // renderer: comment on the first line.\n';
    } else {
      conversationContext += 'Based on the conversation above, provide a helpful and contextually relevant response. If the user wants something visual, choose the appropriate renderer (p5.js for art/animation, D3.js for data visualization, SVG for illustrations/logos/diagrams/icons) and generate the code with the correct // renderer: comment on the first line.\n';
    }

    // Get the last user message
    const lastMessage = messages[messages.length - 1];
    const simplePrompt = lastMessage?.content || '';

    if (!simplePrompt || simplePrompt.trim() === '') {
      return NextResponse.json(
        { error: 'Empty message content' },
        { status: 400 }
      );
    }

    // Use full context with history for better responses
    const prompt = conversationContext.trim();

    // Handle Gemini Native API (Google Generative Language API)
    if (model.startsWith('gemini-')) {
      try {
        const requestBody = {
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: prompt.trim(),
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 4096,
          },
        };

        // Map model names to Gemini API model IDs
        const modelIdMap: Record<string, string> = {
          'gemini-3-flash': 'gemini-3-flash-preview',
          'gemini-native': 'gemini-3-flash-preview',
          'gemini-flash': 'gemini-3-flash-preview',
        };

        const geminiModelId = modelIdMap[model] || 'gemini-3-flash-preview';

        const geminiResponse = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${geminiModelId}:generateContent?key=${API_CONFIG.GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
          }
        );

        if (!geminiResponse.ok) {
          const errorText = await geminiResponse.text();
          console.error('Gemini API Error:', errorText);
          throw new Error(`Gemini API error (${geminiResponse.status}): ${errorText}`);
        }

        const data = await geminiResponse.json();

        if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
          console.error('Invalid Gemini response:', data);
          throw new Error('Invalid response from Gemini API');
        }

        const responseText = data.candidates[0].content.parts[0].text;

        return NextResponse.json({
          message: {
            role: 'assistant',
            content: responseText,
            tokens: Math.ceil(responseText.length / 4),
          },
          usage: {
            promptTokens: Math.ceil(prompt.length / 4),
            completionTokens: Math.ceil(responseText.length / 4),
            totalTokens: Math.ceil((prompt.length + responseText.length) / 4),
          },
        });
      } catch (apiError: any) {
        console.error('Gemini API error:', apiError.message);
        return NextResponse.json(
          {
            error: apiError.message || 'Failed to get response from Gemini API',
            details: apiError.message,
          },
          { status: 500 }
        );
      }
    }

    if (model.startsWith('resita-')) {
      try {
        const response = await axios.get(API_CONFIG.RESITA_BASE_URL, {
          params: {
            prompt: prompt.trim(),
            apikey: API_CONFIG.RESITA_API_KEY,
          },
          timeout: 30000,
        });

        if (response.data.success && response.data.message) {
          return NextResponse.json({
            message: {
              role: 'assistant',
              content: response.data.message,
              tokens: Math.ceil(response.data.message.length / 4),
            },
            usage: {
              promptTokens: Math.ceil(prompt.length / 4),
              completionTokens: Math.ceil(response.data.message.length / 4),
              totalTokens: Math.ceil((prompt.length + response.data.message.length) / 4),
            },
          });
        } else {
          throw new Error(response.data.message || 'API returned unsuccessful response');
        }
      } catch (apiError: any) {
        console.error('Resita API error:', apiError.response?.data || apiError.message);
        const errorMessage = apiError.response?.data?.message
          || apiError.response?.data?.error
          || apiError.message
          || 'Failed to get response from Resita API';

        return NextResponse.json(
          {
            error: errorMessage,
            details: apiError.response?.data || apiError.message
          },
          { status: 500 }
        );
      }
    }

    if (model.startsWith('nekolabs-')) {
      try {
        const modelEndpoints: Record<string, string> = {
          'nekolabs-gpt4o': '/ai/gpt/4o',
          'nekolabs-gpt41': '/ai/gpt/4.1',
          'nekolabs-gpt5mini': '/ai/gpt/5-mini',
          'nekolabs-gpt5nano': '/ai/gpt/5-nano',
        };

        const endpoint = modelEndpoints[model];
        if (!endpoint) {
          throw new Error(`Unknown NekoLabs model: ${model}`);
        }

        const apiUrl = `${API_CONFIG.NEKOLABS_BASE_URL}${endpoint}`;

        const response = await axios.get(apiUrl, {
          params: {
            text: prompt.trim(),
          },
          timeout: 30000,
        });

        if (response.data && response.data.success && response.data.result) {
          return NextResponse.json({
            message: {
              role: 'assistant',
              content: response.data.result,
              tokens: Math.ceil(response.data.result.length / 4),
            },
            usage: {
              promptTokens: Math.ceil(prompt.length / 4),
              completionTokens: Math.ceil(response.data.result.length / 4),
              totalTokens: Math.ceil((prompt.length + response.data.result.length) / 4),
            },
          });
        } else if (response.data && response.data.answer) {
          return NextResponse.json({
            message: {
              role: 'assistant',
              content: response.data.answer,
              tokens: Math.ceil(response.data.answer.length / 4),
            },
            usage: {
              promptTokens: Math.ceil(prompt.length / 4),
              completionTokens: Math.ceil(response.data.answer.length / 4),
              totalTokens: Math.ceil((prompt.length + response.data.answer.length) / 4),
            },
          });
        } else {
          console.error('NekoLabs unexpected format:', response.data);
          throw new Error('API returned no answer or result');
        }
      } catch (apiError: any) {
        console.error('NekoLabs API error:', apiError.response?.data || apiError.message);
        const errorMessage = apiError.response?.data?.message
          || apiError.response?.data?.error
          || apiError.message
          || 'Failed to get response from NekoLabs API';

        return NextResponse.json(
          {
            error: errorMessage,
            details: apiError.response?.data || apiError.message
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      message: {
        role: 'assistant',
        content: 'This model is not yet implemented. Please use Resita or NekoLabs models.',
        tokens: 50,
      },
      usage: {
        promptTokens: 100,
        completionTokens: 50,
        totalTokens: 150,
      },
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat request' },
      { status: 500 }
    );
  }
}

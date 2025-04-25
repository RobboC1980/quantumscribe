import OpenAI from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources';
import fetch from 'node-fetch';
import { createParser } from 'eventsource-parser';
import { ChatMessage } from '../types/chat.js';

const openai = new OpenAI({ apiKey: process.env.OPENAI_KEY });
const DASHSCOPE_API_KEY = process.env.DASHSCOPE_API_KEY;
const DASHSCOPE_API_URL = 'https://dashscope-intl.aliyuncs.com/api/v1/services/aigc/text-generation/generation';

// Function to ask AI for a completion (non-streaming)
export async function askAI(prompt: string): Promise<string> {
  try {
    // This is a simplified implementation
    // In a real app, you would call OpenAI or another AI service
    
    // Mock response for development
    return `AI response to: ${prompt}`;
    
    // Example of how you might call OpenAI API:
    /*
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7
      })
    });

    const data = await response.json();
    return data.choices[0].message.content;
    */
  } catch (error) {
    console.error('AI service error:', error);
    throw new Error('Failed to get AI response');
  }
}

// Function to stream AI responses
export async function* stream(provider: 'openai' | 'qwen' | 'anthropic', messages: ChatMessage[]) {
  if (provider === 'openai') {
    try {
      // Streaming logic would go here
      yield 'This is a mock OpenAI response';
    } catch (error) {
      console.error('OpenAI streaming error:', error);
      throw error;
    }
  } else if (provider === 'qwen') {
    // Stream from DashScope API (Qwen)
    try {
      const response = await fetch(DASHSCOPE_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${DASHSCOPE_API_KEY}`,
          'X-DashScope-SSE': 'enable' // Enable server-sent events
        },
        body: JSON.stringify({
          model: 'qwen-plus',
          input: {
            messages: messages.map(msg => ({
              role: msg.role,
              content: msg.content
            }))
          },
          parameters: {
            result_format: 'message'
          }
        })
      });

      if (!response.ok) {
        const errorData: any = await response.json();
        throw new Error(`DashScope API error: ${errorData.message || response.statusText}`);
      }

      // Process the response stream
      if (!response.body) throw new Error('Response body is null');
      
      const reader = response.body;
      const decoder = new TextDecoder();
      let buffer = '';

      for await (const chunk of reader) {
        // Use decoder.decode with a Uint8Array
        buffer += decoder.decode(new Uint8Array(chunk as Buffer), { stream: true });
        
        // Process complete SSE messages
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';
        
        for (const line of lines) {
          if (line.startsWith('data:')) {
            try {
              const data = JSON.parse(line.slice(5));
              if (data.output?.choices?.[0]?.message?.content) {
                yield data.output.choices[0].message.content;
              }
            } catch (e) {
              console.error('Error parsing SSE data:', e);
            }
          }
        }
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Error streaming from DashScope:', error);
      yield `Error: ${errorMessage}`;
    }
  } else if (provider === 'anthropic') {
    try {
      // Streaming logic would go here
      yield 'This is a mock Anthropic response';
    } catch (error) {
      console.error('Anthropic streaming error:', error);
      throw error;
    }
  } else {
    throw new Error(`Unsupported provider: ${provider}`);
  }
} 
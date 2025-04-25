import OpenAI from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources';

// Mock Qwen client since the package doesn't exist
interface QwenResponse {
  choices: Array<{
    delta?: {
      content?: string;
    };
  }>;
}

class QwenClient {
  constructor(options: { apiKey: string | undefined }) {}
  
  chat = {
    completions: {
      create: async ({ model, stream, messages }: any) => {
        // Mock implementation that returns a simple async iterator
        const mockResponses = [
          "I'm", " a", " mock", " Qwen", " response", " because", " the", " actual", " SDK", " is", " not", " available."
        ];
        
        // Return an async generator that yields chunks
        return {
          async *[Symbol.asyncIterator]() {
            for (const text of mockResponses) {
              yield { choices: [{ delta: { content: text } }] } as QwenResponse;
              await new Promise(resolve => setTimeout(resolve, 100)); // Delay to simulate streaming
            }
          }
        };
      }
    }
  };
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_KEY });
const qwen = new QwenClient({ apiKey: process.env.QWEN_KEY });

export async function* stream(provider: 'openai' | 'qwen', messages: ChatCompletionMessageParam[]) {
  if (provider === 'openai') {
    const res = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      stream: true,
      messages
    });
    for await (const chunk of res) yield chunk.choices[0].delta?.content ?? '';
  } else {
    const res = await qwen.chat.completions.create({
      model: 'qwen-long',
      stream: true,
      messages
    });
    for await (const chunk of res) yield chunk.choices[0].delta?.content ?? '';
  }
} 
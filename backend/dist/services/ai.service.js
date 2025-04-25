import OpenAI from 'openai';
import fetch from 'node-fetch';
const openai = new OpenAI({ apiKey: process.env.OPENAI_KEY });
const DASHSCOPE_API_KEY = process.env.DASHSCOPE_API_KEY;
const DASHSCOPE_API_URL = 'https://dashscope-intl.aliyuncs.com/api/v1/services/aigc/text-generation/generation';
export async function* stream(provider, messages) {
    if (provider === 'openai') {
        const res = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            stream: true,
            messages
        });
        for await (const chunk of res)
            yield chunk.choices[0].delta?.content ?? '';
    }
    else {
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
                const errorData = await response.json();
                throw new Error(`DashScope API error: ${errorData.message || response.statusText}`);
            }
            // Process the response stream
            if (!response.body)
                throw new Error('Response body is null');
            const reader = response.body;
            const decoder = new TextDecoder();
            let buffer = '';
            for await (const chunk of reader) {
                // Use decoder.decode with a Uint8Array
                buffer += decoder.decode(new Uint8Array(chunk), { stream: true });
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
                        }
                        catch (e) {
                            console.error('Error parsing SSE data:', e);
                        }
                    }
                }
            }
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error('Error streaming from DashScope:', error);
            yield `Error: ${errorMessage}`;
        }
    }
}

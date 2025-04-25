import { useState, useRef } from 'react';
import { createParser } from 'eventsource-parser';

export default function AiAssistant() {
  const [provider, setProv] = useState<'openai' | 'qwen'>('openai');
  const [prompt, setPrompt] = useState('');
  const [answer, setAnswer] = useState('');
  const ctrl = useRef<AbortController>();

  async function run() {
    setAnswer('');
    ctrl.current?.abort();
    ctrl.current = new AbortController();

    const res = await fetch('/api/ai/completion', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ provider, prompt }),
      signal: ctrl.current.signal
    });

    const reader = res.body!.getReader();
    const decoder = new TextDecoder();
    const parser = createParser({
      onEvent(event) {
        if (event.data === '[END]') ctrl.current?.abort();
        else setAnswer(a => a + event.data);
      }
    });

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      parser.feed(decoder.decode(value));
    }
  }

  return (
    <main>
      <h1>AI Assistant</h1>
      <select value={provider} onChange={e => setProv(e.target.value as any)}>
        <option value="openai">OpenAI GPT-4o</option>
        <option value="qwen">Qwen-Long</option>
      </select>
      <textarea rows={4} style={{ width: '100%' }} value={prompt} onChange={e => setPrompt(e.target.value)} />
      <button onClick={run}>Ask</button>
      <pre style={{ whiteSpace: 'pre-wrap', marginTop: 16 }}>{answer}</pre>
    </main>
  );
} 
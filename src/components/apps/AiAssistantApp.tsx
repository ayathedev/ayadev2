import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, User, Sparkles, RefreshCw } from 'lucide-react';

export const AiAssistantApp: React.FC = () => {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([
    {
      role: 'assistant',
      content: `Hello! I'm the **Aya OS AI Guide**. I'm running right here on the local hotspot web server. Ask me anything about Aya's engineering background, WebAudio synthesizers, Canvas engines, or offline hotspot setup!`
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    const newMessages = [...messages, { role: 'user' as const, content: userMsg }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg,
          conversationHistory: messages.slice(-5)
        })
      });
      const data = await res.json();
      setMessages([...newMessages, { role: 'assistant', content: data.reply || 'No response.' }]);
    } catch {
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: 'You are connected to the offline local server. Aya Kalimah Satya Ruane is a Software Engineer & Creative Technologist specializing in WebAudio DSP, Canvas 2D/3D graphics, and custom offline hotspot hardware!'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 text-slate-100 font-sans">
      {/* Header */}
      <div className="h-12 bg-slate-900 border-b border-slate-800 px-4 flex items-center gap-2.5 shrink-0">
        <div className="p-1.5 rounded-xl bg-amber-500/20 text-amber-400">
          <Bot className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-xs font-bold text-slate-100">Aya OS AI Portfolio Guide</h3>
          <p className="text-[10px] text-slate-400">Gemini Powered • Local Server 192.168.4.1</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-2.5 max-w-[85%] ${
              m.role === 'user' ? 'ml-auto flex-row-reverse' : ''
            }`}
          >
            <div
              className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}
            >
              {m.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div
              className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                m.role === 'user'
                  ? 'bg-blue-600 text-white font-medium rounded-tr-none'
                  : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none space-y-1'
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-slate-400 text-xs font-mono py-2">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
            <span>AI Thinking on local server...</span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask AI about Aya's projects or skills..."
          className="flex-1 px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="p-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 rounded-xl font-bold transition-colors shadow-sm"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

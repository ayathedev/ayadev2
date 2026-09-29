import React, { useState } from 'react';
import { 
  BrainCircuit, 
  Send, 
  Plus, 
  Settings2, 
  History, 
  Trash2, 
  Cpu, 
  Database, 
  MessageSquare, 
  Save, 
  RefreshCw,
  MoreVertical,
  ChevronDown
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

interface ChatSession {
  id: string;
  title: string;
  model: string;
  lastActive: string;
}

export const OllamaStudioApp: React.FC = () => {
  const [activeSessionId, setActiveSessionId] = useState('1');
  const [input, setInput] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const sessions: ChatSession[] = [
    { id: '1', title: 'Aya OS Architectural Analysis', model: 'llama3:8b', lastActive: '2m ago' },
    { id: '2', title: 'GLSL Shader Debugging', model: 'mistral:latest', lastActive: '1h ago' },
    { id: '3', title: 'Peer Recovery Strategy', model: 'phi3:mini', lastActive: 'yesterday' },
  ];

  const messages: Message[] = [
    { 
      id: '1', 
      role: 'system', 
      content: 'You are an advanced AI assistant integrated into the Aya OS ecosystem. You help Aya Kalimah Satya Ruane with systems engineering, creative coding, and advocacy research.',
      timestamp: '19:14'
    },
    { 
      id: '2', 
      role: 'user', 
      content: 'Analyze the current signal processing pipeline for OL-AVE. How can we optimize the FFT buffer for lower latency?',
      timestamp: '19:15'
    },
    { 
      id: '3', 
      role: 'assistant', 
      content: 'To optimize the FFT buffer in OL-AVE, we should consider a sliding window approach with a smaller buffer size (e.g., 2048 samples) and implement the FFT processing in a dedicated Web Worker to prevent main-thread blocking. Additionally, using Float32Array for all buffer operations will maximize performance through SIMD optimizations in the browser engine.',
      timestamp: '19:15'
    }
  ];

  return (
    <div className="h-full w-full bg-zinc-950 text-zinc-200 flex flex-col font-sans select-none overflow-hidden">
      {/* App Bar */}
      <header className="h-14 border-b border-zinc-800 bg-zinc-900/50 flex items-center justify-between px-4 shrink-0 z-20">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600 rounded-lg shadow-lg shadow-indigo-900/20">
            <BrainCircuit className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-black tracking-tight uppercase">Ollama AI Studio</h1>
            <p className="text-[10px] text-indigo-400 font-mono font-bold leading-none">Local AI Command Center // Active</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-800 border border-zinc-700 text-[10px] font-bold text-zinc-400">
            <RefreshCw className="w-3 h-3 animate-spin-slow" />
            Connected: localhost:11434
          </div>
          <button className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 transition-colors">
            <Settings2 className="w-4 h-4" />
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        {isSidebarOpen && (
          <aside className="w-64 border-r border-zinc-800 bg-zinc-900/30 flex flex-col shrink-0">
            <div className="p-4">
              <button className="w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-900/20">
                <Plus className="w-4 h-4" />
                New Chat
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              <h3 className="px-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 mt-2">Recent Sessions</h3>
              {sessions.map(session => (
                <button
                  key={session.id}
                  onClick={() => setActiveSessionId(session.id)}
                  className={`w-full group flex flex-col gap-1 p-3 rounded-xl transition-all ${
                    activeSessionId === session.id 
                      ? 'bg-zinc-800 ring-1 ring-zinc-700' 
                      : 'hover:bg-zinc-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MessageSquare className={`w-3.5 h-3.5 ${activeSessionId === session.id ? 'text-indigo-400' : 'text-zinc-500'}`} />
                      <span className="text-xs font-bold truncate w-32 text-left">{session.title}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-zinc-500">
                    <span className="font-mono">{session.model}</span>
                    <span>{session.lastActive}</span>
                  </div>
                </button>
              ))}
            </div>

            <div className="p-4 border-t border-zinc-800 space-y-2">
              <div className="flex items-center justify-between text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                <span>Resource Monitor</span>
                <Cpu className="w-3 h-3" />
              </div>
              <div className="space-y-1.5">
                <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 w-[65%]" />
                </div>
                <div className="flex justify-between text-[9px] text-zinc-500 font-mono">
                  <span>MEM: 5.4GB / 8GB</span>
                  <span>65%</span>
                </div>
              </div>
            </div>
          </aside>
        )}

        {/* Chat Interface */}
        <main className="flex-1 flex flex-col bg-zinc-950 relative">
          {/* Header Actions */}
          <div className="h-12 border-b border-zinc-900 flex items-center justify-between px-6 shrink-0 bg-zinc-950/80 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="px-2 py-1 rounded bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-bold text-indigo-400 flex items-center gap-1.5">
                <Cpu className="w-3 h-3" />
                llama3:8b
                <ChevronDown className="w-3 h-3" />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button className="text-[10px] font-bold text-zinc-500 hover:text-zinc-300 flex items-center gap-1.5 transition-colors">
                <Save className="w-3.5 h-3.5" />
                Export
              </button>
              <button className="text-[10px] font-bold text-zinc-500 hover:text-red-400 flex items-center gap-1.5 transition-colors">
                <Trash2 className="w-3.5 h-3.5" />
                Clear
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] space-y-1 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className="flex items-center gap-2 mb-1 px-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                      {msg.role === 'assistant' ? 'Ollama AI' : msg.role === 'system' ? 'System Instruction' : 'Aya'}
                    </span>
                    <span className="text-[9px] text-zinc-600 font-mono">{msg.timestamp}</span>
                  </div>
                  <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/10' 
                      : msg.role === 'system'
                      ? 'bg-zinc-900/50 border border-zinc-800 text-zinc-400 italic'
                      : 'bg-zinc-900 text-zinc-200 border border-zinc-800 shadow-sm'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Input Area */}
          <div className="p-6 bg-gradient-to-t from-zinc-950 via-zinc-950 to-transparent">
            <div className="max-w-4xl mx-auto relative group">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Message Ollama..."
                className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-4 pr-14 text-sm focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none min-h-[56px] max-h-32 resize-none transition-all placeholder:text-zinc-600 group-hover:border-zinc-700"
                rows={1}
              />
              <button className="absolute right-3 bottom-3 p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 transition-all disabled:opacity-50 disabled:hover:bg-indigo-600">
                <Send className="w-4 h-4" />
              </button>
            </div>
            <div className="mt-3 flex items-center justify-center gap-4">
              <span className="text-[9px] text-zinc-600 flex items-center gap-1">
                <Database className="w-3 h-3" />
                IndexedDB Persistent Storage
              </span>
              <span className="text-[9px] text-zinc-600 flex items-center gap-1">
                <Cpu className="w-3 h-3" />
                Local GPU Acceleration
              </span>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

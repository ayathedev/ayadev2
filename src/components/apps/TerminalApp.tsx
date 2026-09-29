import React, { useState, useRef, useEffect } from 'react';
import { Terminal as TerminalIcon, Sparkles } from 'lucide-react';
import { PORTFOLIO_PROJECTS } from '../../data/portfolioData';

export const TerminalApp: React.FC = () => {
  const [history, setHistory] = useState<Array<{ type: 'input' | 'output'; text: string }>>([
    { type: 'output', text: 'Aya OS Portfolio Edition v2.5 (aya-shell)' },
    { type: 'output', text: 'Created by Aya Kalimah Satya Ruane.' },
    { type: 'output', text: 'Type "help" or "neofetch" to begin exploring.\n' },
  ]);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = input.trim();
    if (!cmd) return;

    const newHistory = [...history, { type: 'input' as const, text: `$ ${cmd}` }];
    const lower = cmd.toLowerCase();

    if (lower === 'clear') {
      setHistory([]);
      setInput('');
      return;
    }

    if (lower === 'help') {
      newHistory.push({
        type: 'output',
        text: `Available Commands:
  help       - Show this list of commands
  whoami     - Display OS author information
  neofetch   - Render Aya OS Portfolio Edition system diagnostics
  projects   - List all showcase software engineering projects by Aya
  skills     - View tech stack & capabilities
  matrix     - Toggle visual matrix code mode
  clear      - Clear terminal screen`,
      });
    } else if (lower === 'whoami') {
      newHistory.push({
        type: 'output',
        text: `User: guest@aya-dev-os
Creator: Aya Kalimah Satya Ruane
Role: Software Engineer & Creative Technologist
Node: Aya OS Environment`,
      });
    } else if (lower === 'neofetch') {
      newHistory.push({
        type: 'output',
        text: `       .---.          guest@aya-os-portfolio
      /  .  \\         -----------------------
     |  | |  |        OS: Aya OS Portfolio Edition
     |  | |  |        Kernel: Aya OS Web Engine v2.5
      \\  '  /         Uptime: 100% Offline Standalone
       '---'          Creator: Aya Kalimah Satya Ruane
                      Shell: aya-shell (React + TypeScript)
                      Apps: Terminal, Files, SynthLab, Canvas Studio
                      Node: Active`,
      });
    } else if (lower === 'projects') {
      const projList = PORTFOLIO_PROJECTS.map(
        p => `• [${p.title}] (${p.category}) - ${p.description}`
      ).join('\n');
      newHistory.push({
        type: 'output',
        text: `Projects Created by Aya Kalimah Satya Ruane:\n${projList}`,
      });
    } else if (lower === 'skills') {
      newHistory.push({
        type: 'output',
        text: `Aya Kalimah Satya Ruane's Technical Stack:
Languages: TypeScript, JavaScript, HTML5 Canvas, SQL, C++, Python
Frontend: React 19, Tailwind CSS, Motion, WebAudio API, Canvas 2D
Systems: Express, PWA Service Workers, Captive Portal Networking, Web Sockets`,
      });
    } else if (lower === 'matrix') {
      newHistory.push({
        type: 'output',
        text: `01000001 01111001 01100001 00100000 01001111 01010011 00100000 01000001 01111001 01100001 00100000 01001011 01100001 01101100 01101001 01101101 01100001 01101000 00100000 01010011 01100001 01110100 01101001 01100001 00100000 01010010 01110101 01100001 01101110 01100101 [Aya Dev OS Initialized]`,
      });
    } else {
      newHistory.push({
        type: 'output',
        text: `Command not found: "${cmd}". Type "help" for a list of available commands.`,
      });
    }

    setHistory(newHistory);
    setInput('');
  };

  return (
    <div className="h-full w-full bg-slate-950 font-mono text-xs text-emerald-400 p-4 flex flex-col select-text overflow-hidden">
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-slate-500 text-[11px]">
        <div className="flex items-center gap-2">
          <TerminalIcon className="w-3.5 h-3.5 text-emerald-400" />
          <span>aya-shell - Aya OS Portfolio Edition</span>
        </div>
        <span className="text-slate-600">Aya Kalimah Satya Ruane</span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 pr-2">
        {history.map((item, index) => (
          <div key={index} className="whitespace-pre-wrap leading-relaxed">
            {item.type === 'input' ? (
              <span className="text-cyan-300 font-semibold">{item.text}</span>
            ) : (
              <span className="text-slate-300">{item.text}</span>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleCommand} className="mt-2 pt-2 border-t border-slate-800 flex items-center gap-2">
        <span className="text-cyan-400 font-bold">$</span>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="type a command..."
          className="flex-1 bg-transparent text-emerald-300 focus:outline-none font-mono text-xs"
          autoFocus
        />
      </form>
    </div>
  );
};

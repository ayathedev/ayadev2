
import React, { useState, useRef, useEffect } from 'react';
import { Terminal as TerminalIcon, ChevronRight } from 'lucide-react';

interface TerminalProps {
  onExecute: (cmd: string) => string;
}

interface LogEntry {
  text: string;
  type: 'input' | 'output' | 'error' | 'system';
}

const Terminal: React.FC<TerminalProps> = ({ onExecute }) => {
  const [input, setInput] = useState('');
  const [logs, setLogs] = useState<LogEntry[]>([
    { text: 'SYSTEM ENGINE INITIALIZED.', type: 'system' },
    { text: 'TYPE "HELP" FOR COMMANDS.', type: 'system' }
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = input.trim();
    if (!cmd) return;

    setLogs(prev => [...prev, { text: `> ${cmd}`, type: 'input' }]);
    
    const output = onExecute(cmd);
    if (output) {
      setLogs(prev => [...prev, { text: output, type: output.startsWith('ERROR') ? 'error' : 'output' }]);
    }
    
    setInput('');
  };

  return (
    <div className="flex flex-col h-full bg-white font-sans text-sm overflow-hidden text-black select-none">
      {/* Title Bar */}
      <div className="h-[22px] bg-transparent text-gray-800 border-b border-gray-100 flex items-center justify-between px-2 m-[3px] select-none">
        <div className="flex items-center gap-2">
          <TerminalIcon className="w-3.5 h-3.5 text-gray-800" />
          <span className="text-sm font-bold tracking-normal">Command Shell</span>
        </div>
        <div className="flex gap-[2px] items-center">
          <button className="w-4 h-4 bg-white border-gray-200 rounded-md border text-black font-extrabold text-xs flex items-center justify-center shadow-sm select-none active:scale-95 transition-transform">
            ✕
          </button>
        </div>
      </div>
      
      {/* Terminal Output (Inset Black Screen) */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-3 space-y-1.5 bg-black border-gray-200 rounded-md m-2 text-emerald-400 selection:bg-emerald-800 selection:text-white"
      >
        {logs.map((log, i) => (
          <div 
            key={i} 
            className={`leading-relaxed text-sm ${
              log.type === 'input' ? 'text-white font-bold' : ''
            } ${
              log.type === 'output' ? 'text-emerald-400' : ''
            } ${
              log.type === 'error' ? 'text-red-500 font-bold' : ''
            } ${
              log.type === 'system' ? 'text-gray-500 italic' : ''
            }`}
          >
            {log.text}
          </div>
        ))}
      </div>

      {/* Input Line */}
      <form onSubmit={handleSubmit} className="p-2 border-t border-gray-200 flex items-center gap-2 bg-white">
        <ChevronRight className="w-4 h-4 text-black shrink-0" />
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 bg-white border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none px-1.5 py-1 text-black outline-none font-bold  tracking-normal text-xs"
          placeholder="ENTER COMMAND..."
        />
      </form>
    </div>
  );
};

export default Terminal;

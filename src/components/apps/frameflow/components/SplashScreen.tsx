
import React, { useEffect, useState } from 'react';
import { Camera, Monitor, Sparkles } from 'lucide-react';

interface SplashScreenProps {
  onEnter: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onEnter }) => {
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    const sequence = [
      'Initializing core engine...',
      'Allocating memory buffer',
      'Mounting file system access...',
      'Loading GPU accelerated graphics... [OK]',
      'Establishing secure sandbox... [OK]',
      'System ready.'
    ];

    let i = 0;
    const interval = setInterval(() => {
      if (i < sequence.length) {
        setLogs(prev => [...prev, sequence[i]]);
        i++;
      } else {
        clearInterval(interval);
      }
    }, 150);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 z-[500] bg-[#008080] flex flex-col items-center justify-center font-sans select-none text-black">
      {/* 3D-bevel Setup Wizard Window */}
      <div className="w-[420px] bg-white border-gray-200 rounded-md p-[3px] shadow-2xl relative flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Title Bar */}
        <div className="h-[22px] bg-transparent text-gray-800 border-b border-gray-100 flex items-center justify-between px-1.5 select-none font-bold text-xs tracking-normal">
          <div className="flex items-center gap-1.5">
            <Camera className="w-3.5 h-3.5 text-gray-800" />
            <span>Frame Flow Setup</span>
          </div>
          <div className="flex gap-[2px]">
            <button className="w-4 h-4 bg-white border-gray-200 rounded-md text-black font-bold text-xs flex items-center justify-center">
              ✕
            </button>
          </div>
        </div>

        <div className="p-5 flex flex-col items-center">
          {/* Logo frame */}
          <div className="w-14 h-14 bg-white border-gray-200 rounded-md flex items-center justify-center mb-5 mt-2">
            <Camera className="w-8 h-8 text-black" />
          </div>
          
          <div className="text-center mb-5">
            <h1 className="text-xl font-bold tracking-tight text-black mb-1 font-serif">Welcome to Frame Flow</h1>
            <p className="text-xs font-semibold text-zinc-600">Created by Aya Kalimah Satya Ruane</p>
          </div>

          {/* Setup Output log (Inset) */}
          <div className="w-full h-[120px] p-3 bg-black border-gray-200 rounded-md overflow-hidden font-sans mb-6">
            {(logs || []).map((log, idx) => (
              <div key={idx} className="flex gap-2 text-xs text-emerald-400">
                <span className="text-emerald-600">[{idx.toString().padStart(2, '0')}]</span>
                <span>{log || ''}</span>
              </div>
            ))}
          </div>

          {/* Action button */}
          <button 
            onClick={onEnter}
            disabled={logs.length < 6}
            className={`w-full h-10 font-bold text-xs tracking-normal flex items-center justify-center gap-2 ${
              logs.length < 6 
                ? 'bg-gray-100 border-gray-400 text-gray-500 cursor-not-allowed' 
                : 'bg-zinc-900 border-zinc-900 rounded-md text-white active:scale-95 transition-transform hover:bg-zinc-800'
            }`}
          >
            <Sparkles className="w-4 h-4 text-zinc-300" />
            <span>START APPLICATION</span>
          </button>
        </div>

        {/* Footer info line */}
        <div className="px-4 py-2 border-t border-gray-200 text-gray-700 text-xs flex items-center justify-between font-bold">
          <div className="flex items-center gap-1.5">
            <Monitor className="w-3.5 h-3.5" />
            <span>Copyright &copy; 2026 Aya Kalimah Satya Ruane</span>
          </div>
          <span>Version 1.4.0</span>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;

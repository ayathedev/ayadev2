
import React from 'react';
import { Skull, Zap } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="h-20 border-b-4 border-black flex items-center px-6 justify-between bg-zinc-900 sticky top-0 z-50 overflow-hidden">
      {/* Graffiti background effect */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none select-none overflow-hidden">
        <span className="absolute top-2 left-1/4 text-4xl font-bold -rotate-12">PUNK'S NOT DEAD</span>
        <span className="absolute bottom-2 right-1/4 text-4xl font-bold rotate-6">AYA RULES</span>
      </div>

      <div className="flex items-center gap-4 relative z-10">
        <div className="bg-hotpink p-2 border-black rotate-[-5deg] shadow-sm">
          <Skull className="w-8 h-8 text-black" />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-1 leading-none">
            <h1 className="text-xl font-black tracking-tighter italic graffiti text-hotpink drop-shadow-sm">
              FRAME FLOW
            </h1>
            <span className="text-xs font-black text-white italic tracking-normalst mt-1">BY</span>
          </div>
          <div className="flex items-center gap-1 font-black italic text-toxic tracking-tighter text-lg leading-none">
            <span className="graffiti">A</span>
            <span className="text-2xl mt-[-2px]">Ⓐ</span>
            <span className="graffiti">A</span>
            <span className="graffiti ml-1">DEV</span>
          </div>
        </div>
      </div>

      <nav className="flex items-center gap-6 relative z-10">
        <button 
          onClick={() => alert('Ⓐ Use keys to move. Ⓐ Hit Capture. Ⓐ Stay Wild.')}
          className="punk-btn bg-toxic px-4 py-1 text-xs font-bold  hover:bg-white transition-colors"
        >
          ?? HELP ??
        </button>
        <div className="hidden md:flex items-center gap-2">
          <Zap className="w-4 h-4 text-hotpink fill-hotpink" />
          <span className="text-xs font-black italic text-zinc-400 tracking-normalst">V.666</span>
        </div>
      </nav>
    </header>
  );
};

export default Header;

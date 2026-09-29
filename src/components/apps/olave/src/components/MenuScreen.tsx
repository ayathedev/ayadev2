
import React, { useState } from 'react';
import { Plus, FolderOpen, Info, Sparkles, Wand2, ArrowRight, X, Settings } from 'lucide-react';
import { ProjectState } from '../types';
import { AkornMascot } from './AkornMascot';

interface MenuScreenProps {
  mascotUrl: string | null;
  directorIconUrl: string | null;
  onNewProject: () => void;
  onLoadProject: (project: ProjectState) => void;
  onOpenSettings: () => void;
}

const MenuScreen: React.FC<MenuScreenProps> = ({ mascotUrl, directorIconUrl, onNewProject, onLoadProject, onOpenSettings }) => {
  const [showAbout, setShowAbout] = useState(false);
  const currentSaved = localStorage.getItem('ol_ave_current_project');
  const savedProject: ProjectState | null = currentSaved ? JSON.parse(currentSaved) : null;

  return (
    <div className="h-screen w-screen bg-slate-950 flex items-center justify-center relative overflow-hidden font-inter">
      {mascotUrl ? (
        <div className="absolute inset-0 opacity-20 blur-xl scale-110" style={{ backgroundImage: `url(${mascotUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-tr from-slate-900 via-slate-950 to-black opacity-60" />
      )}
      
      <main className="relative z-10 w-full max-w-5xl px-10 flex flex-col md:flex-row items-center gap-16 animate-in fade-in slide-in-from-bottom-5 duration-1000">
        <div className="flex-1 space-y-8 text-center md:text-left">
          <div className="flex flex-col gap-2">
            {directorIconUrl ? (
              <img src={directorIconUrl} className="w-32 h-32 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] mb-6 mx-auto md:mx-0 border-4 border-white/10 object-cover" />
            ) : (
              <div className="w-32 h-32 bg-amber-950/40 rounded-3xl mb-6 mx-auto md:mx-0 border-4 border-amber-500/20 shadow-[0_20px_50px_rgba(234,88,12,0.3)] flex items-center justify-center overflow-hidden">
                <AkornMascot size={110} pose="director" />
              </div>
            )}
            <h1 className="text-7xl font-black italic text-white leading-tight tracking-tighter drop-shadow-lg">
              OL!<span className="text-red-600">AVE</span>
            </h1>
            <p className="text-slate-400 font-mono text-xs tracking-[0.2em] uppercase opacity-70">Meow Motherfucking Meow</p>
          </div>

          <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-[2.5rem] max-w-sm mx-auto md:mx-0 shadow-2xl">
             <div className="flex items-center gap-4 mb-3">
               <div className="w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center text-purple-400 shadow-inner">
                 <Sparkles size={24} />
               </div>
               <div className="text-left">
                 <h3 className="text-xs font-black uppercase tracking-widest text-white">AyaEye Technology</h3>
                 <p className="text-[10px] text-slate-500 font-medium">Neurodivergent Frame Analysis</p>
               </div>
             </div>
             <p className="text-[11px] text-slate-300 leading-relaxed text-left opacity-80">
               AyaEye intelligence provides visual grading, subject isolation, and context aware soundscape suggestions for your creative sequences. My currently pre-alpha stage framework is based off of the simple idea, that "Neurodivergent minds do it better. At least mine does."
             </p>
          </div>
        </div>

        <div className="w-full md:w-[400px] flex flex-col gap-4">
          <button onClick={onNewProject} className="group relative h-28 bg-red-600 hover:bg-red-500 rounded-[2.5rem] transition-all duration-300 overflow-hidden shadow-[0_25px_50px_rgba(220,38,38,0.2)]">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform"><Plus size={100} /></div>
            <div className="flex items-center gap-6 px-10 h-full relative z-10">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-white"><Plus size={32} /></div>
              <div className="text-left">
                <h2 className="text-xl font-black text-white uppercase tracking-wider leading-tight">New Project</h2>
                <p className="text-xs text-white/60 font-medium">Craft a new visual story</p>
              </div>
            </div>
          </button>

          {savedProject ? (
            <button onClick={() => onLoadProject(savedProject)} className="group relative h-28 bg-slate-900 hover:bg-slate-800 rounded-[2.5rem] border border-white/10 transition-all duration-300 overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-125 transition-transform"><FolderOpen size={100} /></div>
              <div className="flex items-center gap-6 px-10 h-full relative z-10">
                <div className="w-14 h-14 bg-blue-500/20 rounded-2xl flex items-center justify-center text-blue-400 border border-blue-500/30"><FolderOpen size={28} /></div>
                <div className="text-left">
                  <h2 className="text-xl font-black text-white uppercase tracking-wider leading-tight">Continue</h2>
                  <p className="text-xs text-slate-500 font-mono truncate max-w-[180px]">{savedProject.name}</p>
                </div>
              </div>
            </button>
          ) : (
            <div className="h-28 rounded-[2.5rem] border border-dashed border-white/10 flex items-center justify-center text-slate-700 text-[10px] font-black uppercase tracking-[0.4em]">No Projects Found</div>
          )}

          <div className="grid grid-cols-2 gap-4 mt-2">
            <button onClick={onOpenSettings} className="h-16 bg-slate-900 hover:bg-slate-800 border border-white/5 rounded-3xl flex items-center justify-center gap-3 transition-all text-slate-400 hover:text-white group">
              <Settings size={20} className="group-hover:rotate-90 transition-transform duration-500" />
              <span className="text-xs font-black uppercase tracking-widest">Settings</span>
            </button>
            <button onClick={() => setShowAbout(true)} className="h-16 bg-slate-900 hover:bg-slate-800 border border-white/5 rounded-3xl flex items-center justify-center gap-3 transition-all text-slate-400 hover:text-white">
              <span className="flex items-center gap-2">
                <Info size={20} />
                <span className="text-xs font-black uppercase tracking-widest">About</span>
              </span>
            </button>
          </div>
        </div>
      </main>

      {showAbout && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 backdrop-blur-2xl bg-slate-950/70 animate-in fade-in duration-300">
          <div className="w-full max-w-xl bg-slate-900 rounded-[3rem] border border-white/10 p-12 relative shadow-3xl overflow-hidden">
            {/* Background Decorative Element */}
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-red-600/10 rounded-full blur-3xl" />
            
            <div className="absolute top-0 right-0 p-8"><button onClick={() => setShowAbout(false)} className="text-slate-500 hover:text-white transition-colors p-2"><X size={32} /></button></div>
            <div className="flex flex-col items-center text-center space-y-8 relative z-10">
               {directorIconUrl ? <img src={directorIconUrl} className="w-28 h-28 rounded-[2.5rem] border-4 border-white/10 shadow-2xl object-cover" /> : <div className="w-20 h-20 bg-red-600 rounded-[30px]" />}
               <div className="space-y-2">
                <h2 className="text-5xl font-black italic text-white tracking-tighter">OL!<span className="text-red-600">AVE</span></h2>
                <p className="text-sm font-mono uppercase tracking-[0.2em] text-slate-400 opacity-60">Meow Motherfucking Meow</p>
               </div>
               
               <div className="p-6 bg-slate-950/50 rounded-3xl border border-white/5 backdrop-blur-sm">
                 <p className="text-slate-300 text-sm leading-relaxed max-w-md font-medium italic">
                   "Meow meow myow maaawwwwwww mawmawmeow, squirrel sounds. I made an app to do stuff without making me pay for doing it. I suppose i could charge myself, but I'm broke. Just like my heart. Meow."
                 </p>
               </div>

               <div className="pt-6 border-t border-white/5 w-full">
                <p className="text-[10px] text-slate-600 font-mono tracking-widest uppercase">Version 1.2.5 • Established 2025</p>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuScreen;

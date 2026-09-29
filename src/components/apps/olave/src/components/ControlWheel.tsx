
import React from 'react';
import { Video, Music, Layers, Type, Play, Pause, Plus, Image as ImageIcon } from 'lucide-react';

interface ControlWheelProps {
  onAddMedia: (type: 'video' | 'image') => void;
  onAddAudio: () => void;
  onAddLayer: () => void;
  onAddText: () => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
}

const ControlWheel: React.FC<ControlWheelProps> = ({ 
  onAddMedia, 
  onAddAudio, 
  onAddLayer, 
  onAddText, 
  isPlaying, 
  onTogglePlay 
}) => {
  return (
    <div className="relative w-64 h-64 flex items-center justify-center bg-slate-900/50 rounded-full border-4 border-slate-700 shadow-2xl overflow-visible">
      {/* Media - Top */}
      <button 
        onClick={() => onAddMedia('video')}
        className="absolute top-0 transform -translate-y-1/2 flex flex-col items-center group transition-all"
      >
        <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center text-white shadow-lg group-hover:scale-110 group-active:scale-95">
          <Video size={32} />
        </div>
        <span className="text-xs font-bold mt-2 text-slate-400 group-hover:text-white uppercase tracking-wider">Media</span>
      </button>

      {/* Audio - Right */}
      <button 
        onClick={onAddAudio}
        className="absolute right-0 transform translate-x-1/2 flex flex-col items-center group transition-all"
      >
        <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg group-hover:scale-110 group-active:scale-95">
          <Music size={32} />
        </div>
        <span className="text-xs font-bold mt-2 text-slate-400 group-hover:text-white uppercase tracking-wider">Audio</span>
      </button>

      {/* Layer - Left */}
      <button 
        onClick={onAddLayer}
        className="absolute left-0 transform -translate-x-1/2 flex flex-col items-center group transition-all"
      >
        <div className="w-16 h-16 bg-amber-600 rounded-full flex items-center justify-center text-white shadow-lg group-hover:scale-110 group-active:scale-95">
          <Layers size={32} />
        </div>
        <span className="text-xs font-bold mt-2 text-slate-400 group-hover:text-white uppercase tracking-wider">Layer</span>
      </button>

      {/* Text/Action - Bottom */}
      <button 
        onClick={onAddText}
        className="absolute bottom-0 transform translate-y-1/2 flex flex-col items-center group transition-all"
      >
        <div className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center text-white shadow-lg group-hover:scale-110 group-active:scale-95">
          <Type size={32} />
        </div>
        <span className="text-xs font-bold mt-2 text-slate-400 group-hover:text-white uppercase tracking-wider">Text</span>
      </button>

      {/* Center - Play/Pause */}
      <button 
        onClick={onTogglePlay}
        className="z-10 w-24 h-24 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full flex items-center justify-center transition-all group active:scale-90"
      >
        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-slate-900 group-hover:scale-105 shadow-xl">
          {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
        </div>
      </button>
      
      {/* Decorative inner circle */}
      <div className="absolute inset-4 border border-slate-700/50 rounded-full pointer-events-none"></div>
    </div>
  );
};

export default ControlWheel;

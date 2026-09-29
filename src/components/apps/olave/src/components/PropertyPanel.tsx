
import React from 'react';
import { Clip, VisualFilters, ProjectState } from '../types';
import { Sliders, Sparkles, Wand2, Type as TypeIcon, Loader2, Info, Volume2, Activity, Music, VolumeX, Eraser, AudioLines, Music2, Volume1, Zap, Check } from 'lucide-react';

interface PropertyPanelProps {
  project?: ProjectState;
  selectedClip: Clip | null;
  isAnalyzing: boolean;
  masterVolume: number;
  onUpdateFilters: (filters: VisualFilters) => void;
  onUpdateAudio: (volume: number, pan: number) => void;
  onUpdateTextConfig: (config: any) => void;
  onUpdateMasterVolume: (volume: number) => void;
  onAIEnhance: () => void;
  onApplyAIRecommendations?: (suggestedFilters: Partial<VisualFilters>) => void;
  onRemoveBackground: () => void;
  onGenerateCaptions: () => void;
}

const PropertyPanel: React.FC<PropertyPanelProps> = ({ 
  project, selectedClip, isAnalyzing, masterVolume, onUpdateFilters, onUpdateAudio, onUpdateTextConfig, onUpdateMasterVolume, onAIEnhance, onApplyAIRecommendations, onRemoveBackground, onGenerateCaptions
}) => {
  if (!selectedClip) {
    return (
      <div className="w-80 bg-slate-900 border-l border-slate-800 flex flex-col h-full overflow-hidden shadow-2xl">
        <div className="p-4 bg-slate-950/50 border-b border-slate-800 flex items-center justify-between">
          <h2 className="font-bold text-slate-200 text-sm">Project Mixer</h2>
          <Activity size={16} className="text-blue-400" />
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-8 flex flex-col">
          <section className="bg-slate-800/20 rounded-3xl p-6 border border-slate-800/50 w-full flex flex-col items-center">
             <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-8">Master Gain</h3>
             <div className="flex gap-6 items-end">
               <div className="h-48 w-12 bg-slate-950 rounded-xl relative flex items-center p-1 border border-slate-800 shadow-inner">
                  <input type="range" min="0" max="150" value={masterVolume} onChange={(e) => onUpdateMasterVolume(parseInt(e.target.value))} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full rotate-180" style={{ writingMode: 'vertical-lr' }} />
                  <div className="absolute w-8 h-6 bg-blue-600 rounded shadow-2xl pointer-events-none left-1.5 transition-all duration-75" style={{ bottom: `${(masterVolume / 150) * 85 + 5}%` }} />
               </div>
               <div className="flex flex-col items-center">
                 <span className="text-xl font-mono text-blue-400 font-black">{masterVolume}%</span>
                 <Volume2 size={24} className="mt-4 text-slate-700" />
               </div>
             </div>
          </section>

          <section className="space-y-4">
             <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Track Overview</h3>
             <div className="grid grid-cols-4 gap-2">
                {[
                  { label: 'MED', color: 'bg-red-500/20', icon: <Music size={12} className="text-red-400" /> },
                  { label: 'FX', color: 'bg-amber-500/20', icon: <Zap size={12} className="text-amber-400" /> },
                  { label: 'TXT', color: 'bg-emerald-500/20', icon: <TypeIcon size={12} className="text-emerald-400" /> },
                  { label: 'AUD', color: 'bg-blue-500/20', icon: <Volume1 size={12} className="text-blue-400" /> }
                ].map(t => (
                  <div key={t.label} className={`flex flex-col items-center p-2 rounded-xl ${t.color} border border-white/5`}>
                     <div className="h-12 w-1 bg-current rounded-full relative overflow-hidden">
                        <div className="absolute bottom-0 w-full bg-current opacity-40 animate-pulse" style={{ height: `${20 + Math.random() * 40}%` }} />
                     </div>
                     <span className="text-[8px] font-black mt-2 opacity-60">{t.label}</span>
                  </div>
                ))}
             </div>
          </section>
        </div>
      </div>
    );
  }

  const handleFilterChange = (key: keyof VisualFilters, value: number) => {
    onUpdateFilters({ ...selectedClip.filters, [key]: value });
  };

  const renderSlider = (label: string, key: keyof VisualFilters, min: number, max: number, color: string) => (
    <div key={key} className="space-y-1">
      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
        <span>{label}</span>
        <span className={color}>{selectedClip.filters[key]}</span>
      </div>
      <input type="range" min={min} max={max} value={selectedClip.filters[key]} onChange={(e) => handleFilterChange(key, parseInt(e.target.value))} className={`w-full h-1 bg-slate-800 rounded-full appearance-none accent-current ${color}`} />
    </div>
  );

  return (
    <div className="w-80 bg-slate-900 border-l border-slate-800 flex flex-col h-full overflow-hidden shadow-2xl">
      <div className="p-4 bg-slate-950/50 border-b border-slate-800 flex items-center justify-between shrink-0">
        <h2 className="font-bold text-slate-200 truncate text-sm">{selectedClip.name}</h2>
        <span className={`text-[9px] px-2 py-1 rounded font-black uppercase border ${
          selectedClip.type === 'video' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
          selectedClip.type === 'audio' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 
          'bg-slate-800 text-slate-400 border-slate-700'
        }`}>{selectedClip.type}</span>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-8 scroll-smooth pb-12">
        
        {/* AyaEye SCENE INSIGHT */}
        {(selectedClip.type === 'video' || selectedClip.type === 'image') && (
          <section className="bg-slate-800/20 rounded-2xl p-4 border border-slate-800/50 overflow-hidden relative">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                <Info size={14} className="text-blue-400" /> AyaEye Intelligence
              </h3>
            </div>
            
            {isAnalyzing ? (
              <div className="flex flex-col items-center justify-center py-10 space-y-3">
                <Loader2 size={24} className="text-blue-500 animate-spin" />
                <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest animate-pulse">Neural Frame Scan...</span>
              </div>
            ) : selectedClip.aiAnalysis ? (
              <div className="space-y-5 animate-in fade-in duration-500">
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/50">
                    <span className="text-[8px] text-blue-400/70 font-black uppercase tracking-widest block mb-1">Look Name</span>
                    <div className="text-[11px] font-bold text-white truncate">{selectedClip.aiAnalysis.lookName}</div>
                  </div>
                  <div className="bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/50">
                    <span className="text-[8px] text-slate-500 font-black uppercase tracking-widest block mb-1">Vibe</span>
                    <div className="text-[11px] font-medium text-slate-300 truncate">{selectedClip.aiAnalysis.mood}</div>
                  </div>
                </div>

                <div className="space-y-3 bg-blue-500/5 p-4 rounded-xl border border-blue-500/10">
                   <div className="flex items-center justify-between">
                     <span className="text-[10px] font-black text-blue-300 uppercase tracking-widest">Recommended Grade</span>
                     <Sparkles size={14} className="text-blue-400" />
                   </div>
                   <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[9px] font-mono text-slate-500 uppercase">
                     {Object.entries(selectedClip.aiAnalysis.suggestedFilters || {}).map(([key, val]) => (
                       <div key={key} className="flex justify-between">
                         <span>{key}</span>
                         <span className="text-blue-400 font-bold">{val}</span>
                       </div>
                     ))}
                   </div>
                   <button 
                    onClick={() => onApplyAIRecommendations?.(selectedClip.aiAnalysis!.suggestedFilters || {})}
                    className="w-full mt-2 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
                   >
                     <Wand2 size={12} /> Apply Neural Look
                   </button>
                </div>

                <div className="bg-gradient-to-br from-purple-500/10 via-slate-900 to-transparent p-4 rounded-2xl border border-purple-500/20 shadow-xl relative group">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-7 h-7 bg-purple-500/20 rounded-lg flex items-center justify-center text-purple-400 border border-purple-500/20">
                      <Music2 size={16} />
                    </div>
                    <span className="text-[10px] font-black text-purple-300 uppercase tracking-widest">Aura Suggestions</span>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <div className="text-[8px] text-purple-400/80 uppercase font-black mb-1">Music</div>
                      <div className="text-[10px] text-slate-300 leading-relaxed italic">
                        {selectedClip.aiAnalysis.suggestedMusic}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5 pt-2 border-t border-white/5">
                      {selectedClip.aiAnalysis.suggestedSFX?.map((sfx, i) => (
                        <span key={i} className="text-[7px] font-black uppercase tracking-widest px-2 py-1 bg-slate-950/80 rounded border border-white/5 text-slate-500">{sfx}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <button 
                onClick={onAIEnhance}
                className="w-full py-8 border-2 border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center hover:bg-slate-800/30 hover:border-blue-500/30 transition-all group"
              >
                <Sparkles size={32} className="text-slate-700 mb-2 group-hover:text-blue-500 group-hover:scale-110 transition-all" />
                <div className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">Scan with AyaEye</div>
              </button>
            )}
          </section>
        )}

        {/* AUDIO MIXER SECTION */}
        {(selectedClip.type === 'video' || selectedClip.type === 'audio') && (
          <section className="bg-slate-800/20 rounded-2xl p-4 border border-slate-800/50 space-y-6">
            <h3 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <AudioLines size={14} /> Audio Mixer
            </h3>
            
            <div className="space-y-4">
               <div className="space-y-2">
                 <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-slate-500">
                   <span>Gain Level</span>
                   <span className="text-blue-400">{selectedClip.volume}%</span>
                 </div>
                 <div className="flex items-center gap-3">
                   <VolumeX size={14} className="text-slate-600" />
                   <input 
                    type="range" 
                    min="0" 
                    max="200" 
                    value={selectedClip.volume} 
                    onChange={(e) => onUpdateAudio(parseInt(e.target.value), selectedClip.pan)}
                    className="flex-1 h-1.5 bg-slate-800 rounded-full appearance-none accent-blue-500" 
                   />
                   <Volume2 size={14} className="text-blue-500" />
                 </div>
               </div>

               <div className="space-y-2">
                 <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-slate-500">
                   <span>Stereo Panning</span>
                   <span className="text-slate-300">
                     {selectedClip.pan === 0 ? 'Center' : selectedClip.pan < 0 ? `L ${Math.abs(selectedClip.pan)}` : `R ${selectedClip.pan}`}
                   </span>
                 </div>
                 <div className="flex items-center gap-3 px-1">
                   <span className="text-[8px] font-black text-slate-600">L</span>
                   <div className="flex-1 h-8 bg-slate-950 rounded-lg relative flex items-center p-1 border border-slate-800 overflow-hidden">
                     <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-slate-800" />
                     <input 
                      type="range" 
                      min="-100" 
                      max="100" 
                      value={selectedClip.pan} 
                      onChange={(e) => onUpdateAudio(selectedClip.volume, parseInt(e.target.value))}
                      className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                     />
                     <div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-blue-600 rounded-sm shadow-xl pointer-events-none border border-white/20" style={{ left: `calc(${(selectedClip.pan + 100) / 2}% - 8px)` }} />
                   </div>
                   <span className="text-[8px] font-black text-slate-600">R</span>
                 </div>
               </div>
            </div>
          </section>
        )}

        <section className="grid grid-cols-2 gap-2">
          <button onClick={onGenerateCaptions} className="p-3 bg-slate-800 hover:bg-purple-900/30 rounded-xl border border-slate-700 transition-all flex flex-col items-center gap-1 group">
            <TypeIcon size={16} className="text-purple-400 group-hover:scale-110" /><span className="text-[9px] font-black uppercase">Captions</span>
          </button>
          <button onClick={onRemoveBackground} className="p-3 bg-slate-800 hover:bg-cyan-900/30 rounded-xl border border-slate-700 transition-all flex flex-col items-center gap-1 group">
            <Eraser size={16} className="text-cyan-400 group-hover:scale-110" /><span className="text-[9px] font-black uppercase">Isolate</span>
          </button>
        </section>

        <section className="space-y-4">
          <h3 className="text-[10px] font-black text-blue-500 uppercase tracking-widest flex items-center gap-2"><Sliders size={14} /> Basic Visuals</h3>
          {renderSlider("Brightness", "brightness", 0, 200, "text-blue-400")}
          {renderSlider("Contrast", "contrast", 0, 200, "text-blue-400")}
          {renderSlider("Saturation", "saturation", 0, 200, "text-blue-400")}
          {renderSlider("Opacity", "opacity", 0, 100, "text-blue-400")}
          {renderSlider("Blur", "blur", 0, 50, "text-blue-400")}
        </section>
      </div>
    </div>
  );
};

export default PropertyPanel;

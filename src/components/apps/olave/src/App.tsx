
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ProjectState, Clip, INITIAL_FILTERS, ClipType, VisualFilters } from './types';
import Timeline from './components/Timeline';
import PropertyPanel from './components/PropertyPanel';
import MenuScreen from './components/MenuScreen';
import SettingsScreen from './components/SettingsScreen';
import { 
  Download, Settings, Video, Search, Undo2, Redo2, 
  Music, ArrowLeft, Play, Pause, Square, CameraIcon, Type, Film
} from 'lucide-react';
import { gemini } from './services/geminiService';
import { AkornMascot } from './components/AkornMascot';

const MAX_HISTORY = 50;
const AUTO_SAVE_INTERVAL = 120000;

type AppView = 'splash' | 'menu' | 'editor' | 'settings';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('splash');
  const [mascotUrl, setMascotUrl] = useState<string | null>(null);
  const [directorIconUrl, setDirectorIconUrl] = useState<string | null>(null);
  const [project, setProject] = useState<ProjectState>({
    id: 'proj-' + Date.now(),
    name: 'Untitled Project',
    clips: [],
    currentTime: 0,
    duration: 60,
    playing: false,
    selectedClipId: null,
    zoom: 120,
    masterVolume: 100,
  });

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [history, setHistory] = useState<{ past: Clip[][]; future: Clip[][] }>({
    past: [],
    future: [],
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const mediaElementsRef = useRef<Map<string, HTMLVideoElement | HTMLImageElement | HTMLAudioElement>>(new Map());
  const currentTimeRef = useRef(0);

  useEffect(() => {
    let timer: any;
    const initApp = async () => {
      try {
        const [splashUrl, iconUrl] = await Promise.all([
          gemini.generateMascot(),
          gemini.generateDirectorMascot()
        ]);
        if (splashUrl) setMascotUrl(splashUrl);
        if (iconUrl) setDirectorIconUrl(iconUrl);
      } catch (err) {
        console.warn("Init mascot fetch warning:", err);
      }
    };
    initApp();
    timer = setTimeout(() => {
      setView(v => (v === 'splash' ? 'menu' : v));
    }, 3500);
    return () => clearTimeout(timer);
  }, []);

  // Sync internal ref with project time for the drawing loop
  useEffect(() => {
    currentTimeRef.current = project.currentTime;
  }, [project.currentTime]);

  useEffect(() => {
    const currentClips = project.clips;
    const currentMap = mediaElementsRef.current;
    const clipIds = new Set(currentClips.map(c => c.id));
    
    for (const id of currentMap.keys()) {
      if (!clipIds.has(id)) {
        const el = currentMap.get(id);
        if (el instanceof HTMLVideoElement) {
          el.pause();
          el.src = "";
          el.load();
        }
        currentMap.delete(id);
      }
    }
    
    currentClips.forEach(clip => {
      if (!currentMap.has(clip.id)) {
        if (clip.type === 'video') {
          const video = document.createElement('video');
          video.src = clip.source;
          video.muted = true;
          video.preload = 'auto';
          video.playsInline = true;
          currentMap.set(clip.id, video);
        } else if (clip.type === 'image') {
          const img = new Image();
          img.src = clip.source;
          currentMap.set(clip.id, img);
        } else if (clip.type === 'audio') {
          const audio = document.createElement('audio');
          audio.src = clip.source;
          currentMap.set(clip.id, audio);
        }
      }
    });
  }, [project.clips]);

  const pushToHistory = useCallback((currentClips: Clip[]) => {
    setHistory(prev => ({
      past: [currentClips, ...prev.past].slice(0, MAX_HISTORY),
      future: [],
    }));
  }, []);

  const handleUndo = useCallback(() => {
    setHistory(prev => {
      if (prev.past.length === 0) return prev;
      const [previous, ...remainingPast] = prev.past;
      setProject(proj => ({ ...proj, clips: previous }));
      return { past: remainingPast, future: [project.clips, ...prev.future] };
    });
  }, [project.clips]);

  const handleRedo = useCallback(() => {
    setHistory(prev => {
      if (prev.future.length === 0) return prev;
      const [next, ...remainingFuture] = prev.future;
      setProject(proj => ({ ...proj, clips: next }));
      return { past: [project.clips, ...prev.past], future: remainingFuture };
    });
  }, [project.clips]);

  const handleNewProject = () => {
    setProject({ id: 'proj-' + Date.now(), name: 'New Sequence', clips: [], currentTime: 0, duration: 60, playing: false, selectedClipId: null, zoom: 120, masterVolume: 100 });
    setHistory({ past: [], future: [] });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (view !== 'editor') return;
      if (e.code === 'Space') {
        e.preventDefault();
        handleTogglePlay();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        if (e.shiftKey) handleRedo(); else handleUndo();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') handleRedo();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [project.playing, view]);

  const handleAddMedia = (type: ClipType) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = type === 'video' ? 'video/*' : type === 'image' ? 'image/*' : 'audio/*';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (!file) return;
      pushToHistory(project.clips);
      const url = URL.createObjectURL(file);
      const newClip: Clip = {
        id: `clip-${Date.now()}`, type, name: file.name, source: url,
        startTime: project.currentTime, duration: type === 'image' ? 5 : 10, offset: 0,
        layerIndex: (type === 'video' || type === 'image') ? 0 : 7,
        filters: { ...INITIAL_FILTERS }, volume: 100, pan: 0, backgroundRemoved: false,
      };
      setProject(prev => ({ ...prev, clips: [...prev.clips, newClip], selectedClipId: newClip.id }));
    };
    input.click();
  };

  const handleAddManualText = () => {
    pushToHistory(project.clips);
    const newTextClip: Clip = {
      id: `text-${Date.now()}`, type: 'text', name: 'New Text', source: '', startTime: project.currentTime, duration: 3, offset: 0, layerIndex: 5,
      filters: { ...INITIAL_FILTERS }, volume: 100, pan: 0,
      textConfig: { content: 'New Text Layer', fontSize: 48, color: '#ffffff', fontFamily: 'Inter', x: 50, y: 50 }
    };
    setProject(prev => ({ ...prev, clips: [...prev.clips, newTextClip], selectedClipId: newTextClip.id }));
  };

  const handleTogglePlay = () => setProject(prev => ({ ...prev, playing: !prev.playing }));
  const handleSeek = (time: number) => setProject(prev => ({ ...prev, currentTime: Math.max(0, Math.min(prev.duration, time)) }));
  const handleStop = () => setProject(prev => ({ ...prev, playing: false, currentTime: 0 }));

  // Fixed missing handlers for Timeline component
  const handleClipSelect = (id: string | null) => setProject(prev => ({ ...prev, selectedClipId: id }));
  const handleZoom = (delta: number) => setProject(prev => ({ ...prev, zoom: Math.max(20, Math.min(1000, prev.zoom + delta)) }));
  const handleResetZoom = () => setProject(prev => ({ ...prev, zoom: 120 }));
  
  const handleExportFrame = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `olave-frame-${formatTime(project.currentTime).replace(/:/g, '-')}.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  const handleUpdateAudio = (volume: number, pan: number) => {
    setProject(p => ({
      ...p,
      clips: p.clips.map(c => c.id === p.selectedClipId ? { ...c, volume, pan } : c)
    }));
  };

  const handleTrimLeft = (id: string, start: number, duration: number, offset: number) => {
    pushToHistory(project.clips);
    setProject(p => ({
      ...p,
      clips: p.clips.map(c => c.id === id ? { ...c, startTime: start, duration, offset } : c)
    }));
  };

  const handleTrimRight = (id: string, duration: number) => {
    pushToHistory(project.clips);
    setProject(p => ({
      ...p,
      clips: p.clips.map(c => c.id === id ? { ...c, duration } : c)
    }));
  };

  const handleApplyAIRecommendations = (suggestedFilters: Partial<VisualFilters>) => {
    if (!project.selectedClipId) return;
    pushToHistory(project.clips);
    setProject(p => ({
      ...p,
      clips: p.clips.map(c => 
        c.id === p.selectedClipId 
          ? { ...c, filters: { ...c.filters, ...suggestedFilters } } 
          : c
      )
    }));
  };

  const handleAIEnhance = async () => {
    if (!project.selectedClipId || isAnalyzing) return;
    const clip = project.clips.find(c => c.id === project.selectedClipId);
    if (!clip || !canvasRef.current) return;

    setIsAnalyzing(true);
    try {
      const frameData = canvasRef.current.toDataURL('image/jpeg', 0.8);
      const analysis = await gemini.describeScene(frameData);
      if (analysis) {
        setProject(prev => ({
          ...prev,
          clips: prev.clips.map(c => c.id === clip.id ? { ...c, aiAnalysis: analysis } : c)
        }));
      }
    } catch (err) {
      console.error("Analysis failed", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Playback loop - High precision
  useEffect(() => {
    if (view !== 'editor') return;
    if (project.playing) {
      let lastTimestamp = performance.now();
      const tick = (now: number) => {
        const delta = (now - lastTimestamp) / 1000;
        lastTimestamp = now;
        
        currentTimeRef.current += delta;
        
        if (currentTimeRef.current >= project.duration) {
          setProject(p => ({ ...p, playing: false, currentTime: p.duration }));
          return;
        }

        // Only update React state occasionally or on stop to avoid re-render bottleneck
        // But for timeline playhead we need it at a reasonable rate
        if (Math.floor(currentTimeRef.current * 10) !== Math.floor((currentTimeRef.current - delta) * 10)) {
          setProject(p => ({ ...p, currentTime: currentTimeRef.current }));
        }

        animationFrameRef.current = requestAnimationFrame(tick);
      };
      animationFrameRef.current = requestAnimationFrame(tick);
    } else {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    }
    return () => { if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current); };
  }, [project.playing, project.duration, view]);

  // Canvas drawing loop
  useEffect(() => {
    if (view !== 'editor' || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d', { alpha: false });
    if (!ctx) return;

    const { width, height } = canvasRef.current;
    
    const draw = () => {
      const curTime = currentTimeRef.current;
      ctx.fillStyle = '#050505';
      ctx.fillRect(0, 0, width, height);

      const activeClips = project.clips
        .filter(c => curTime >= c.startTime && curTime <= c.startTime + c.duration)
        .sort((a, b) => a.layerIndex - b.layerIndex);

      activeClips.forEach(clip => {
        ctx.save();
        const f = clip.filters;
        ctx.filter = `brightness(${f.brightness}%) contrast(${f.contrast}%) saturate(${f.saturation}%) blur(${f.blur}px) sepia(${f.sepia}%) grayscale(${f.grayscale}%) invert(${f.invert}%)`;
        ctx.globalAlpha = f.opacity / 100;

        if (clip.type === 'text' && clip.textConfig) {
          ctx.fillStyle = clip.textConfig.color;
          ctx.font = `bold ${clip.textConfig.fontSize}px Inter`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(clip.textConfig.content, (clip.textConfig.x / 100) * width, (clip.textConfig.y / 100) * height);
        } else {
          const media = mediaElementsRef.current.get(clip.id);
          if (media) {
            const clipRelativeTime = curTime - clip.startTime + clip.offset;

            if (clip.type === 'video' && media instanceof HTMLVideoElement) {
              if (project.playing) {
                if (media.paused) media.play().catch(() => {});
                if (Math.abs(media.currentTime - clipRelativeTime) > 0.15) {
                  media.currentTime = clipRelativeTime;
                }
              } else {
                if (!media.paused) media.pause();
                if (Math.abs(media.currentTime - clipRelativeTime) > 0.04) {
                  media.currentTime = clipRelativeTime;
                }
              }
            }

            if (media instanceof HTMLVideoElement || media instanceof HTMLImageElement) {
              const mediaWidth = media instanceof HTMLVideoElement ? media.videoWidth : media.width;
              const mediaHeight = media instanceof HTMLVideoElement ? media.videoHeight : media.height;
              
              if (mediaWidth > 0 && mediaHeight > 0) {
                const ratio = Math.min(width / mediaWidth, height / mediaHeight);
                const cx = (width - mediaWidth * ratio) / 2;
                const cy = (height - mediaHeight * ratio) / 2;
                ctx.drawImage(media, 0, 0, mediaWidth, mediaHeight, cx, cy, mediaWidth * ratio, mediaHeight * ratio);
              }
            }
          }
        }
        ctx.restore();
      });

      if (project.playing) {
        animationFrameRef.current = requestAnimationFrame(draw);
      }
    };

    if (!project.playing) draw();
    else animationFrameRef.current = requestAnimationFrame(draw);

    return () => { if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current); };
  }, [project.currentTime, project.playing, project.clips, view]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}:${ms.toString().padStart(2, '0')}`;
  };

  if (view === 'splash') {
    return (
      <div 
        onClick={() => setView('menu')}
        className="h-screen w-screen bg-slate-950 flex flex-col items-center justify-center overflow-hidden relative cursor-pointer group"
      >
        {mascotUrl && (
          <div className="absolute inset-0 opacity-40 blur-sm scale-110" style={{ backgroundImage: `url(${mascotUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
        )}
        <div className="relative z-10 flex flex-col items-center animate-in zoom-in-95 duration-700">
           {directorIconUrl ? (
             <img src={directorIconUrl} className="w-40 h-40 rounded-[2.5rem] mb-8 shadow-[0_25px_60px_rgba(0,0,0,0.6)] border-4 border-white/10 object-cover" />
           ) : (
             <div className="mb-8 w-44 h-44 rounded-[2.5rem] bg-gradient-to-br from-amber-600/30 to-red-950/80 border-4 border-amber-500/20 shadow-[0_25px_60px_rgba(234,88,12,0.35)] flex items-center justify-center backdrop-blur-xl">
               <AkornMascot size={150} pose="director" />
             </div>
           )}
           <h1 className="text-8xl font-black italic text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.3)] tracking-tighter mb-3">OL!<span className="text-red-600">AVE</span></h1>
           <div className="flex items-center gap-2 mb-3">
             <span className="text-xs px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 font-bold uppercase tracking-widest border border-amber-500/30">
               Studio Mascot: Akorn
             </span>
           </div>
           <p className="text-sm font-mono uppercase tracking-[0.2em] text-slate-400 opacity-60">Meow Motherfucking Meow</p>
           <span className="text-[10px] text-slate-500 font-mono tracking-widest uppercase mt-8 opacity-40 group-hover:opacity-100 transition-opacity">
             Click anywhere to enter &rarr;
           </span>
        </div>
      </div>
    );
  }

  if (view === 'menu') return <MenuScreen mascotUrl={mascotUrl} directorIconUrl={directorIconUrl} onNewProject={() => { handleNewProject(); setView('editor'); }} onLoadProject={(p) => { setProject(p); setView('editor'); }} onOpenSettings={() => setView('settings')} />;
  if (view === 'settings') return <SettingsScreen onBack={() => setView('menu')} />;

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-950 text-slate-100 overflow-hidden font-inter selection:bg-red-500/30">
      <header className="h-14 bg-slate-900/90 backdrop-blur-xl border-b border-slate-800 px-6 flex items-center justify-between z-[100]">
        <div className="flex items-center gap-5">
          <button onClick={() => setView('menu')} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-all mr-2"><ArrowLeft size={18} /></button>
          {directorIconUrl ? (
            <img src={directorIconUrl} className="w-10 h-10 rounded-xl shadow-lg border border-white/10 object-cover" />
          ) : (
            <div className="w-10 h-10 bg-amber-950/60 rounded-xl border border-amber-500/30 flex items-center justify-center overflow-hidden">
              <AkornMascot size={36} pose="director" />
            </div>
          )}
          <div className="h-5 w-[1px] bg-slate-700" />
          <div className="flex flex-col">
            <h1 className="font-bold text-xs tracking-widest text-slate-400 uppercase">{project.name}</h1>
            <span className="text-[10px] text-slate-500 font-mono">ID: {project.id}</span>
          </div>
          <div className="flex items-center gap-1 ml-4 bg-slate-800/50 p-1 rounded-lg border border-slate-700/50">
            <button onClick={handleUndo} disabled={history.past.length === 0} className="p-1.5 rounded disabled:text-slate-600 transition-colors"><Undo2 size={16} /></button>
            <button onClick={handleRedo} disabled={history.future.length === 0} className="p-1.5 rounded disabled:text-slate-600 transition-colors"><Redo2 size={16} /></button>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <button onClick={() => { localStorage.setItem('ol_ave_current_project', JSON.stringify(project)); alert("Sequence Exported (Simulation)"); }} className="bg-red-600 hover:bg-red-500 text-white px-6 py-2 rounded-full font-bold text-xs uppercase tracking-widest shadow-xl transition-all">
            <Download size={16} className="inline mr-2" /> Export
          </button>
        </div>
      </header>
      
      <main className="flex-1 flex overflow-hidden">
        <nav className="w-16 bg-slate-900 border-r border-slate-800 flex flex-col items-center py-6 gap-6 shadow-2xl z-50">
          <button onClick={() => handleAddMedia('video')} className="p-3 bg-red-600/10 hover:bg-red-600 rounded-2xl group transition-all" title="Add Video">
            <Film size={20} className="text-red-400 group-hover:text-white" />
          </button>
          <button onClick={() => handleAddMedia('image')} className="p-3 bg-blue-600/10 hover:bg-blue-600 rounded-2xl group transition-all" title="Add Image">
            <Search size={20} className="text-blue-400 group-hover:text-white" />
          </button>
          <button onClick={() => handleAddMedia('audio')} className="p-3 bg-indigo-600/10 hover:bg-indigo-600 rounded-2xl group transition-all" title="Add Audio">
            <Music size={20} className="text-indigo-400 group-hover:text-white" />
          </button>
          <button onClick={handleAddManualText} className="p-3 bg-emerald-600/10 hover:bg-emerald-600 rounded-2xl group transition-all" title="Add Text Layer">
            <Type size={20} className="text-emerald-400 group-hover:text-white" />
          </button>
          <div className="flex-1" />
          <button onClick={() => setView('settings')} className="p-3 bg-slate-800 hover:bg-slate-700 rounded-2xl group transition-all" title="Global Settings">
            <Settings size={20} className="text-slate-300 group-hover:text-white" />
          </button>
        </nav>
        
        <section className="flex-1 flex flex-col bg-[#020202] relative overflow-hidden">
          <div className="flex-1 flex flex-col items-center justify-center p-8 gap-8 relative">
             <div className="flex flex-col items-center gap-8 w-full max-w-5xl">
                <div className="relative w-full max-w-4xl aspect-video bg-black rounded-[1.5rem] border-4 border-slate-800 shadow-[0_30px_100px_rgba(0,0,0,0.8)] overflow-hidden group">
                  <canvas ref={canvasRef} width={1920} height={1080} className="w-full h-full object-contain" />
                  <div className="absolute top-4 left-4 flex gap-2">
                    <div className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 flex items-center gap-2">
                       <div className={`w-2 h-2 rounded-full ${project.playing ? 'bg-red-500 animate-pulse' : 'bg-slate-600'}`} />
                       <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/70">preview monitor</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-12 px-10 py-4 bg-slate-900/60 backdrop-blur-xl rounded-full border border-white/5 shadow-2xl transition-all hover:bg-slate-900/80">
                   <div className="text-xs font-mono text-slate-500 tabular-nums">{formatTime(project.currentTime)}</div>
                   <div className="flex items-center gap-8">
                     <button onClick={handleTogglePlay} className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-300 hover:text-red-500 transition-all active:scale-95 flex items-center gap-2">
                       {project.playing ? <><Pause size={14} fill="currentColor" /> pause</> : <><Play size={14} fill="currentColor" /> play</>}
                     </button>
                     <button onClick={handleStop} className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-300 hover:text-white transition-all active:scale-95 flex items-center gap-2">
                       <Square size={14} fill="currentColor" /> stop
                     </button>
                     <button onClick={handleExportFrame} className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-300 hover:text-blue-400 transition-all active:scale-95 flex items-center gap-2">
                       <CameraIcon size={14} /> export frame
                     </button>
                   </div>
                   <div className="text-xs font-mono text-slate-500 tabular-nums opacity-40">{formatTime(project.duration)}</div>
                </div>
             </div>
          </div>

          <Timeline project={project} onClipSelect={handleClipSelect} onClipMove={(id, start, layer) => { pushToHistory(project.clips); setProject(p => ({ ...p, clips: p.clips.map(c => c.id === id ? { ...c, startTime: start, layerIndex: layer } : c) })); }} onClipDelete={(id) => setProject(p => ({ ...p, clips: p.clips.filter(c => c.id !== id) }))} onClipSplit={(id) => {}} onClipTrimLeft={handleTrimLeft} onClipTrimRight={handleTrimRight} onClipDuplicate={(id, l) => {}} onClipExtractAudio={(id) => {}} onSeek={handleSeek} onZoom={handleZoom} onResetZoom={handleResetZoom} />
        </section>

        <PropertyPanel 
          project={project} 
          selectedClip={project.clips.find(c => c.id === project.selectedClipId) || null} 
          isAnalyzing={isAnalyzing} 
          masterVolume={project.masterVolume} 
          onUpdateFilters={(f) => setProject(p => ({ ...p, clips: p.clips.map(c => c.id === p.selectedClipId ? { ...c, filters: f } : c) }))} 
          onUpdateAudio={handleUpdateAudio} 
          onUpdateTextConfig={() => {}} 
          onUpdateMasterVolume={(v) => setProject(p => ({ ...p, masterVolume: v }))} 
          onAIEnhance={handleAIEnhance} 
          onApplyAIRecommendations={handleApplyAIRecommendations}
          onRemoveBackground={() => {}} 
          onGenerateCaptions={() => {}} 
        />
      </main>
    </div>
  );
};

export default App;

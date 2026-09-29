
import React, { useRef, useState, useEffect } from 'react';
import { Clip, ProjectState } from '../types';
import { Scissors, Trash2, Copy, Volume2, ArrowLeftToLine, ArrowRightToLine, Layers, SquarePlus, ZoomIn, ZoomOut, Type, Video, Film, Music, Sparkles, Magnet } from 'lucide-react';

interface TimelineProps {
  project: ProjectState;
  onClipSelect: (id: string | null) => void;
  onClipMove: (id: string, newStartTime: number, newLayer: number) => void;
  onClipDelete: (id: string) => void;
  onClipSplit: (id: string) => void;
  onClipTrimLeft: (id: string, newStartTime: number, newDuration: number, newOffset: number) => void;
  onClipTrimRight: (id: string, newDuration: number) => void;
  onClipDuplicate: (id: string, asLayer: boolean) => void;
  onClipExtractAudio: (id: string) => void;
  onSeek: (time: number) => void;
  onZoom: (delta: number) => void;
  onResetZoom: () => void;
}

interface InteractionState {
  type: 'move' | 'trim-left' | 'trim-right';
  clipId: string;
  initialMouseX: number;
  initialStartTime: number;
  initialDuration: number;
  initialOffset: number;
  initialLayer: number;
  currentStartTime: number;
  currentDuration: number;
  currentOffset: number;
  currentLayer: number;
}

const Timeline: React.FC<TimelineProps> = ({ 
  project, 
  onClipSelect, 
  onClipMove,
  onClipDelete, 
  onClipSplit,
  onClipTrimLeft,
  onClipTrimRight,
  onClipDuplicate,
  onClipExtractAudio,
  onSeek,
  onZoom,
  onResetZoom
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isSnappingEnabled, setIsSnappingEnabled] = useState(true);
  const [interactionState, setInteractionState] = useState<InteractionState | null>(null);
  const zoom = project.zoom;

  const getSnappedTime = (targetTime: number, excludeClipId?: string): number => {
    if (!isSnappingEnabled) return targetTime;
    const SNAP_THRESHOLD_PX = 10;
    const snapThresholdTime = SNAP_THRESHOLD_PX / zoom;
    const points: number[] = [0, project.currentTime];
    project.clips.forEach(clip => {
      if (clip.id !== excludeClipId) {
        points.push(clip.startTime);
        points.push(clip.startTime + clip.duration);
      }
    });
    let nearestPoint = targetTime;
    let minDelta = snapThresholdTime;
    points.forEach(p => {
      const delta = Math.abs(targetTime - p);
      if (delta < minDelta) {
        minDelta = delta;
        nearestPoint = p;
      }
    });
    return nearestPoint;
  };

  const handleTimelineClick = (e: React.MouseEvent) => {
    if (interactionState) return;
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left + containerRef.current.scrollLeft;
    const targetTime = x / zoom;
    const snappedTime = getSnappedTime(targetTime);
    onSeek(snappedTime);
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      onZoom(e.deltaY > 0 ? -20 : 20);
    }
  };

  const startDrag = (e: React.MouseEvent, clip: Clip) => {
    e.stopPropagation();
    onClipSelect(clip.id);
    setInteractionState({
      type: 'move',
      clipId: clip.id,
      initialMouseX: e.clientX,
      initialStartTime: clip.startTime,
      initialDuration: clip.duration,
      initialOffset: clip.offset,
      initialLayer: clip.layerIndex,
      currentStartTime: clip.startTime,
      currentDuration: clip.duration,
      currentOffset: clip.offset,
      currentLayer: clip.layerIndex,
    });
  };

  const startTrim = (e: React.MouseEvent, clip: Clip, type: 'trim-left' | 'trim-right') => {
    e.stopPropagation();
    onClipSelect(clip.id);
    setInteractionState({
      type,
      clipId: clip.id,
      initialMouseX: e.clientX,
      initialStartTime: clip.startTime,
      initialDuration: clip.duration,
      initialOffset: clip.offset,
      initialLayer: clip.layerIndex,
      currentStartTime: clip.startTime,
      currentDuration: clip.duration,
      currentOffset: clip.offset,
      currentLayer: clip.layerIndex,
    });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!interactionState || !containerRef.current) return;

      const deltaX = e.clientX - interactionState.initialMouseX;
      const deltaTime = deltaX / zoom;
      const MIN_DURATION = 0.1;

      if (interactionState.type === 'move') {
        const containerRect = containerRef.current.getBoundingClientRect();
        const scrollLeft = containerRef.current.scrollLeft;
        const clipElementOffset = interactionState.initialMouseX - (interactionState.initialStartTime * zoom + containerRect.left - scrollLeft);
        const x = e.clientX - containerRect.left + scrollLeft - clipElementOffset;
        let targetTime = Math.max(0, x / zoom);
        targetTime = getSnappedTime(targetTime, interactionState.clipId);

        const timelineY = e.clientY - containerRect.top + containerRef.current.scrollTop;
        let detectedLayer = interactionState.currentLayer;
        let currentY = 0;
        const trackHeight = 48;
        const trackGroupsMeta = [
          { start: 0, count: 3 },
          { start: 3, count: 2 },
          { start: 5, count: 2 },
          { start: 7, count: 3 }
        ];

        for (const group of trackGroupsMeta) {
          currentY += 28;
          for (let i = 0; i < group.count; i++) {
            if (timelineY >= currentY && timelineY < currentY + trackHeight) {
              detectedLayer = group.start + i;
            }
            currentY += trackHeight;
          }
          currentY += 16;
        }

        setInteractionState(prev => prev ? ({
          ...prev,
          currentStartTime: targetTime,
          currentLayer: detectedLayer
        }) : null);
      } else if (interactionState.type === 'trim-left') {
        let newStart = interactionState.initialStartTime + deltaTime;
        let newDuration = interactionState.initialDuration - deltaTime;
        let newOffset = interactionState.initialOffset + deltaTime;

        if (newDuration < MIN_DURATION) {
          newDuration = MIN_DURATION;
          newStart = interactionState.initialStartTime + interactionState.initialDuration - MIN_DURATION;
          newOffset = interactionState.initialOffset + interactionState.initialDuration - MIN_DURATION;
        }
        if (newStart < 0) {
          newDuration = interactionState.initialStartTime + interactionState.initialDuration;
          newStart = 0;
          newOffset = interactionState.initialOffset - interactionState.initialStartTime;
        }

        setInteractionState(prev => prev ? ({
          ...prev,
          currentStartTime: newStart,
          currentDuration: newDuration,
          currentOffset: newOffset
        }) : null);
      } else if (interactionState.type === 'trim-right') {
        let newDuration = interactionState.initialDuration + deltaTime;
        if (newDuration < MIN_DURATION) newDuration = MIN_DURATION;

        setInteractionState(prev => prev ? ({
          ...prev,
          currentDuration: newDuration
        }) : null);
      }
    };

    const handleMouseUp = () => {
      if (interactionState) {
        if (interactionState.type === 'move') {
          onClipMove(interactionState.clipId, interactionState.currentStartTime, interactionState.currentLayer);
        } else if (interactionState.type === 'trim-left') {
          onClipTrimLeft(interactionState.clipId, interactionState.currentStartTime, interactionState.currentDuration, interactionState.currentOffset);
        } else if (interactionState.type === 'trim-right') {
          onClipTrimRight(interactionState.clipId, interactionState.currentDuration);
        }
        setInteractionState(null);
      }
    };

    if (interactionState) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [interactionState, zoom, isSnappingEnabled]);

  const trackGroups = [
    { name: 'Video / Media', icon: <Film size={14} />, layers: [0, 1, 2], color: 'text-red-400' },
    { name: 'Overlays / FX', icon: <Sparkles size={14} />, layers: [3, 4], color: 'text-amber-400' },
    { name: 'Titles / Text', icon: <Type size={14} />, layers: [5, 6], color: 'text-emerald-400' },
    { name: 'Audio Tracks', icon: <Music size={14} />, layers: [7, 8, 9], color: 'text-blue-400' }
  ];

  const selectedClip = project.clips.find(c => c.id === project.selectedClipId);

  return (
    <div className={`flex-1 flex flex-col bg-slate-900 overflow-hidden relative border-t border-slate-800 shadow-[0_-10px_30px_rgba(0,0,0,0.5)] ${interactionState ? 'cursor-grabbing' : ''}`}>
      <div className="h-12 bg-slate-950/80 border-b border-slate-800 flex items-center px-4 gap-1 z-[60]">
        {selectedClip ? (
          <div className="flex items-center gap-1 w-full animate-in fade-in slide-in-from-top-2 duration-300">
            <button onClick={() => onClipSplit(selectedClip.id)} className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-800 rounded-md text-slate-300 transition-all group" title="Split at Playhead">
              <Scissors size={16} className="group-hover:text-red-400" />
              <span className="text-xs font-semibold uppercase tracking-wider">Split</span>
            </button>
            <div className="flex items-center gap-1">
              <button onClick={() => {}} className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-800 rounded-md text-slate-300 transition-all group opacity-50 cursor-not-allowed">
                <ArrowLeftToLine size={16} />
                <span className="text-xs font-semibold uppercase tracking-wider">Trim Left</span>
              </button>
              <button onClick={() => {}} className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-800 rounded-md text-slate-300 transition-all group opacity-50 cursor-not-allowed">
                <ArrowRightToLine size={16} />
                <span className="text-xs font-semibold uppercase tracking-wider">Trim Right</span>
              </button>
            </div>
            <div className="w-px h-6 bg-slate-800 mx-2" />
            <button onClick={() => onClipDuplicate(selectedClip.id, false)} className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-800 rounded-md text-slate-300 transition-all group" title="Duplicate After">
              <Copy size={16} className="group-hover:text-emerald-400" />
              <span className="text-xs font-semibold uppercase tracking-wider">Duplicate</span>
            </button>
            <button onClick={() => onClipDuplicate(selectedClip.id, true)} className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-800 rounded-md text-slate-300 transition-all group" title="Duplicate as Layer">
              <Layers size={16} className="group-hover:text-amber-400" />
              <span className="text-xs font-semibold uppercase tracking-wider">As Layer</span>
            </button>
            {selectedClip.type === 'video' && (
              <button onClick={() => onClipExtractAudio(selectedClip.id)} className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-800 rounded-md text-slate-300 transition-all group" title="Extract Audio to new track">
                <Volume2 size={16} className="group-hover:text-purple-400" />
                <span className="text-xs font-semibold uppercase tracking-wider">Extract Audio</span>
              </button>
            )}
            <div className="flex-1" />
            <button onClick={() => onClipDelete(selectedClip.id)} className="flex items-center gap-2 px-3 py-1.5 hover:bg-red-900/40 text-red-400 rounded-md transition-all font-bold uppercase tracking-wider">
              <Trash2 size={16} />
              <span className="text-xs">Delete</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-slate-600">
            <SquarePlus size={16} />
            <span className="text-xs font-medium uppercase tracking-widest">Select a clip to edit</span>
          </div>
        )}
        <div className="flex items-center gap-1 ml-auto border-l border-slate-800 pl-4 pr-2">
           <button onClick={() => setIsSnappingEnabled(!isSnappingEnabled)} className={`p-1.5 rounded transition-all ${isSnappingEnabled ? 'bg-blue-500/20 text-blue-400' : 'text-slate-500 hover:bg-slate-800'}`} title={isSnappingEnabled ? "Magnetic Snapping: ON" : "Magnetic Snapping: OFF"}>
            <Magnet size={16} className={isSnappingEnabled ? 'animate-pulse' : ''} />
          </button>
        </div>
        <div className="flex items-center gap-1 border-l border-slate-800 pl-4">
          <button onClick={() => onZoom(-30)} className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors" title="Zoom Out (Ctrl+Scroll Down)">
            <ZoomOut size={16} />
          </button>
          <button onClick={onResetZoom} className="px-2 py-1 hover:bg-slate-800 rounded text-[10px] font-bold text-slate-500 hover:text-white transition-colors uppercase tracking-widest" title="Reset Zoom">
            {Math.round((project.zoom / 120) * 100)}%
          </button>
          <button onClick={() => onZoom(30)} className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors" title="Zoom In (Ctrl+Scroll Up)">
            <ZoomIn size={16} />
          </button>
        </div>
      </div>

      <div className="h-8 border-b border-slate-800 flex items-end relative overflow-hidden bg-slate-950 z-20">
        {Array.from({ length: Math.ceil(project.duration * 2) + 1 }).map((_, i) => (
          <div key={i} className={`absolute h-full border-l flex flex-col justify-end pb-1 ${i % 2 === 0 ? 'border-slate-700 h-full' : 'border-slate-800 h-1/2'}`} style={{ left: (i * 0.5) * zoom }}>
            {i % 2 === 0 && <span className="text-[10px] text-slate-500 ml-1 leading-none font-mono">{(i * 0.5).toFixed(1)}s</span>}
          </div>
        ))}
      </div>

      <div ref={containerRef} className="flex-1 overflow-x-auto overflow-y-auto relative p-4 scroll-smooth outline-none bg-slate-900/50" onClick={handleTimelineClick} onWheel={handleWheel} tabIndex={0}>
        <div style={{ width: project.duration * zoom, minWidth: '100%', position: 'relative' }}>
          {trackGroups.map((group) => (
            <div key={group.name} className="mb-4">
              <div className="flex items-center gap-2 px-2 py-1 mb-1 border-b border-slate-800/50">
                <span className={`${group.color} opacity-80`}>{group.icon}</span>
                <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${group.color} opacity-60`}>{group.name}</span>
              </div>
              {group.layers.map((layerIdx) => {
                const isTargetLayer = interactionState?.currentLayer === layerIdx;
                return (
                  <div key={layerIdx} className={`h-12 border-b border-slate-800/30 flex items-center relative group/track transition-colors duration-200 ${isTargetLayer ? 'bg-slate-800/40 shadow-inner' : ''}`}>
                    <div className={`absolute left-[-4px] top-0 bottom-0 w-1 transition-colors ${isTargetLayer ? 'bg-blue-500' : 'bg-slate-800 group-hover/track:bg-slate-700'}`} />
                    <div className="absolute left-0 top-0 text-[8px] uppercase font-bold text-slate-600/20 px-2 py-1 select-none pointer-events-none">L{layerIdx}</div>
                    {project.clips.filter(c => c.layerIndex === layerIdx).map(clip => {
                      const isSelected = project.selectedClipId === clip.id;
                      const isInteractingWithThis = interactionState?.clipId === clip.id;
                      const left = (isInteractingWithThis ? interactionState!.currentStartTime : clip.startTime) * zoom;
                      const width = (isInteractingWithThis ? interactionState!.currentDuration : clip.duration) * zoom;
                      
                      return (
                        <div
                          key={clip.id}
                          onMouseDown={(e) => startDrag(e, clip)}
                          className={`absolute h-9 rounded-md border-2 flex items-center px-2 transition-all group/clip ${
                            isSelected 
                              ? 'border-white z-30 shadow-[0_0_25px_rgba(255,255,255,0.25)] ring-2 ring-white/10' 
                              : `border-white/5 z-10 hover:border-white/20 ${project.selectedClipId ? 'opacity-60' : 'opacity-100'}`
                          } ${isInteractingWithThis ? 'z-[100] scale-[1.01]' : ''}`}
                          style={{ 
                            left, 
                            width,
                            backgroundColor: clip.type === 'video' ? 'rgba(239, 68, 68, 0.45)' : 
                                             clip.type === 'audio' ? 'rgba(59, 130, 246, 0.45)' :
                                             clip.type === 'text' ? 'rgba(16, 185, 129, 0.45)' : 'rgba(245, 158, 11, 0.45)'
                          }}
                        >
                          {isSelected && (
                            <>
                              <div 
                                onMouseDown={(e) => startTrim(e, clip, 'trim-left')}
                                className="absolute left-[-4px] top-0 bottom-0 w-3 cursor-ew-resize flex items-center justify-center z-[110]"
                              >
                                <div className="w-1.5 h-full bg-white rounded-l-md shadow-lg" />
                              </div>
                              <div 
                                onMouseDown={(e) => startTrim(e, clip, 'trim-right')}
                                className="absolute right-[-4px] top-0 bottom-0 w-3 cursor-ew-resize flex items-center justify-center z-[110]"
                              >
                                <div className="w-1.5 h-full bg-white rounded-r-md shadow-lg" />
                              </div>
                            </>
                          )}
                          <div className="flex items-center gap-2 overflow-hidden w-full relative z-10 select-none pointer-events-none">
                            {clip.type === 'audio' && <Music size={12} className="text-blue-200 shrink-0" />}
                            {clip.type === 'video' && <Video size={12} className="text-red-200 shrink-0" />}
                            {clip.type === 'text' && <Type size={12} className="text-emerald-200 shrink-0" />}
                            <span className={`text-[10px] truncate font-bold uppercase tracking-tight text-white drop-shadow-md ${isSelected ? 'opacity-100' : 'opacity-80'}`}>{clip.name}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          ))}

          <div className="absolute top-0 bottom-0 w-[2px] bg-red-500 z-[70] pointer-events-none shadow-[0_0_15px_rgba(239,68,68,1)]" style={{ left: project.currentTime * zoom }}>
            <div className="absolute -top-1 -left-[6px] w-[14px] h-[14px] bg-red-500 rounded-sm rotate-45 border-2 border-white" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Timeline;

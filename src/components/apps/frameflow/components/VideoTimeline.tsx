import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { Camera, ChevronLeft, ChevronRight, Bookmark, Clock, Image as ImageIcon } from 'lucide-react';
import { CapturedFrame } from '../types';

interface VideoTimelineProps {
  currentTime: number;
  duration: number;
  capturedFrames: CapturedFrame[];
  onSeek: (time: number) => void;
  disabled?: boolean;
  formatTime: (time: number) => string;
}

export const VideoTimeline: React.FC<VideoTimelineProps> = ({
  currentTime,
  duration,
  capturedFrames = [],
  onSeek,
  disabled = false,
  formatTime,
}) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverX, setHoverX] = useState<number>(0);
  const [hoveredFrame, setHoveredFrame] = useState<{ frame: CapturedFrame; x: number } | null>(null);

  // Filter frames belonging to current duration range
  const validFrames = useMemo(() => {
    if (!capturedFrames || duration <= 0) return [];
    return capturedFrames.filter(f => typeof f.timestamp === 'number' && f.timestamp >= 0 && f.timestamp <= duration);
  }, [capturedFrames, duration]);

  // Sort frames chronologically for prev/next jumping
  const sortedFrames = useMemo(() => {
    return [...validFrames].sort((a, b) => a.timestamp - b.timestamp);
  }, [validFrames]);

  // Find nearest previous and next captured frame
  const { prevFrame, nextFrame } = useMemo(() => {
    if (sortedFrames.length === 0) return { prevFrame: null, nextFrame: null };
    const prev = [...sortedFrames].reverse().find(f => f.timestamp < currentTime - 0.08) || null;
    const next = sortedFrames.find(f => f.timestamp > currentTime + 0.08) || null;
    return { prevFrame: prev, nextFrame: next };
  }, [sortedFrames, currentTime]);

  const getTimeFromEvent = useCallback((e: MouseEvent | React.MouseEvent) => {
    if (!trackRef.current || duration <= 0) return 0;
    const rect = trackRef.current.getBoundingClientRect();
    const clientX = 'clientX' in e ? e.clientX : 0;
    const offsetX = Math.max(0, Math.min(rect.width, clientX - rect.left));
    const ratio = rect.width > 0 ? offsetX / rect.width : 0;
    return Math.max(0, Math.min(duration, ratio * duration));
  }, [duration]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (disabled || duration <= 0) return;
    setIsDragging(true);
    const newTime = getTimeFromEvent(e);
    onSeek(newTime);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newTime = getTimeFromEvent(e);
      onSeek(newTime);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, getTimeFromEvent, onSeek]);

  const handleTrackMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (duration <= 0 || !trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const offsetX = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    setHoverX(offsetX);
    setHoverTime((offsetX / rect.width) * duration);
  };

  const handleTrackMouseLeave = () => {
    if (!isDragging) {
      setHoverTime(null);
    }
  };

  // Generate tick marks (e.g. 20 ticks across the timeline)
  const ticks = useMemo(() => {
    const totalTicks = 24;
    return Array.from({ length: totalTicks + 1 }, (_, i) => ({
      percent: (i / totalTicks) * 100,
      isMajor: i % 6 === 0,
      isMid: i % 3 === 0 && i % 6 !== 0,
    }));
  }, []);

  const progressPercent = duration > 0 ? Math.min(100, Math.max(0, (currentTime / duration) * 100)) : 0;

  return (
    <div className="w-full bg-slate-900/90 text-white rounded-xl p-2.5 border border-slate-800 shadow-sm select-none">
      {/* Header bar: Info & Navigation shortcuts */}
      <div className="flex items-center justify-between text-xs mb-1.5 px-0.5">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 font-bold text-zinc-300 text-[11px] uppercase tracking-wider">
            <Camera className="w-3.5 h-3.5 text-amber-400" />
            <span>Frame Timeline</span>
          </span>
          {validFrames.length > 0 && (
            <span className="text-[10px] font-semibold bg-amber-400/20 text-amber-300 border border-amber-400/30 px-1.5 py-0.2 rounded-md">
              {validFrames.length} {validFrames.length === 1 ? 'capture' : 'captures'} marked
            </span>
          )}
        </div>

        {/* Previous / Next marker shortcuts */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={!prevFrame || disabled}
            onClick={() => prevFrame && onSeek(prevFrame.timestamp)}
            className={`px-1.5 py-0.5 rounded text-[10px] font-bold flex items-center gap-0.5 transition-colors ${
              prevFrame && !disabled
                ? 'bg-slate-800 hover:bg-slate-700 text-zinc-200 cursor-pointer border border-slate-700'
                : 'bg-slate-800/40 text-zinc-600 cursor-not-allowed border border-transparent'
            }`}
            title={prevFrame ? `Jump to frame at ${formatTime(prevFrame.timestamp)}` : 'No previous captured frame'}
          >
            <ChevronLeft className="w-3 h-3" />
            <span>Prev Snap</span>
          </button>

          <button
            type="button"
            disabled={!nextFrame || disabled}
            onClick={() => nextFrame && onSeek(nextFrame.timestamp)}
            className={`px-1.5 py-0.5 rounded text-[10px] font-bold flex items-center gap-0.5 transition-colors ${
              nextFrame && !disabled
                ? 'bg-slate-800 hover:bg-slate-700 text-zinc-200 cursor-pointer border border-slate-700'
                : 'bg-slate-800/40 text-zinc-600 cursor-not-allowed border border-transparent'
            }`}
            title={nextFrame ? `Jump to frame at ${formatTime(nextFrame.timestamp)}` : 'No next captured frame'}
          >
            <span>Next Snap</span>
            <ChevronRight className="w-3 h-3" />
          </button>

          <span className="text-[10px] font-mono text-zinc-400 ml-1">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* Interactive Timeline Track */}
      <div className="relative pt-1 pb-2">
        <div
          ref={trackRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleTrackMouseMove}
          onMouseLeave={handleTrackMouseLeave}
          className={`relative w-full h-8 bg-slate-950 rounded-lg border border-slate-800 overflow-visible cursor-pointer flex items-center ${
            disabled ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {/* Tick marks ruler */}
          <div className="absolute inset-0 flex pointer-events-none overflow-hidden rounded-lg">
            {ticks.map((t, idx) => (
              <div
                key={idx}
                className="absolute top-0 bottom-0 flex flex-col justify-between items-center"
                style={{ left: `${t.percent}%` }}
              >
                <div
                  className={`w-px ${
                    t.isMajor ? 'h-2 bg-slate-600' : t.isMid ? 'h-1.5 bg-slate-700' : 'h-1 bg-slate-800'
                  }`}
                />
                <div
                  className={`w-px ${
                    t.isMajor ? 'h-2 bg-slate-600' : t.isMid ? 'h-1.5 bg-slate-700' : 'h-1 bg-slate-800'
                  }`}
                />
              </div>
            ))}
          </div>

          {/* Background center track rail */}
          <div className="absolute left-0 right-0 h-1.5 bg-slate-800/90 rounded-full mx-1" />

          {/* Played progress fill */}
          <div
            className="absolute left-1 h-1.5 bg-zinc-300 rounded-full transition-all duration-75 pointer-events-none"
            style={{ width: `calc(${progressPercent}% - 8px)` }}
          />

          {/* Hover time indicator line */}
          {hoverTime !== null && duration > 0 && !isDragging && (
            <div
              className="absolute top-0 bottom-0 w-px bg-zinc-400/80 pointer-events-none z-10"
              style={{ left: `${hoverX}px` }}
            >
              <div className="absolute -top-5 -translate-x-1/2 bg-zinc-800 text-zinc-200 text-[9px] font-mono px-1 py-0.2 rounded border border-zinc-700 shadow-sm whitespace-nowrap">
                {formatTime(hoverTime)}
              </div>
            </div>
          )}

          {/* Captured Frame Markers */}
          {validFrames.map((frame, index) => {
            const framePercent = (frame.timestamp / duration) * 100;
            const isHovered = hoveredFrame?.frame.id === frame.id;
            const isCurrent = Math.abs(currentTime - frame.timestamp) < 0.15;

            return (
              <div
                key={frame.id || index}
                onClick={(e) => {
                  e.stopPropagation();
                  onSeek(frame.timestamp);
                }}
                onMouseEnter={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setHoveredFrame({ frame, x: rect.left + rect.width / 2 });
                }}
                onMouseLeave={() => setHoveredFrame(null)}
                className="absolute z-20 -translate-x-1/2 flex flex-col items-center group cursor-pointer"
                style={{ left: `${framePercent}%` }}
              >
                {/* Marker vertical pin line */}
                <div className="w-0.5 h-6 bg-amber-400/60 group-hover:bg-amber-300 transition-colors" />

                {/* Marker pin badge / diamond */}
                <div
                  className={`w-3.5 h-3.5 rounded-sm rotate-45 flex items-center justify-center transition-transform group-hover:scale-125 ${
                    isCurrent
                      ? 'bg-amber-400 ring-2 ring-white shadow-md'
                      : 'bg-amber-500 group-hover:bg-amber-400 shadow-xs'
                  }`}
                  title={`Snap #${frame.frameNumber || index + 1} at ${formatTime(frame.timestamp)}`}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-950 -rotate-45" />
                </div>
              </div>
            );
          })}

          {/* Current Playhead Needle */}
          <div
            className="absolute z-30 -translate-x-1/2 top-0 bottom-0 pointer-events-none flex flex-col items-center justify-center"
            style={{ left: `${progressPercent}%` }}
          >
            {/* Top needle head */}
            <div className="w-2.5 h-2.5 bg-white rounded-full shadow-md border border-slate-900" />
            {/* Vertical needle bar */}
            <div className="w-0.5 flex-1 bg-white shadow-xs" />
            {/* Bottom needle cap */}
            <div className="w-1.5 h-1.5 bg-white rounded-full" />
          </div>
        </div>

        {/* Hovered Marker Floating Popover Card */}
        {hoveredFrame && (
          <div
            className="absolute bottom-11 z-40 -translate-x-1/2 bg-slate-900/95 backdrop-blur-sm text-white p-2 rounded-xl border border-slate-700 shadow-xl pointer-events-none flex items-center gap-2.5 animate-in fade-in zoom-in-95 duration-100"
            style={{
              left: `${(hoveredFrame.frame.timestamp / duration) * 100}%`,
            }}
          >
            {hoveredFrame.frame.dataUrl ? (
              <img
                src={hoveredFrame.frame.dataUrl}
                alt="Captured Snapshot"
                className="w-16 h-10 object-cover rounded-lg border border-slate-700 bg-black shrink-0"
              />
            ) : (
              <div className="w-16 h-10 rounded-lg bg-slate-800 flex items-center justify-center border border-slate-700 shrink-0">
                <ImageIcon className="w-4 h-4 text-zinc-400" />
              </div>
            )}
            <div className="flex flex-col text-left">
              <div className="flex items-center gap-1 text-[11px] font-bold text-amber-400">
                <Camera className="w-3 h-3" />
                <span>Snap #{hoveredFrame.frame.frameNumber || 1}</span>
              </div>
              <span className="text-[10px] font-mono text-zinc-300">
                {formatTime(hoveredFrame.frame.timestamp)}
              </span>
              <span className="text-[9px] text-zinc-400 truncate max-w-[120px]">
                {hoveredFrame.frame.fileName || 'Snapshot'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Timeline Footer Labels */}
      <div className="flex justify-between items-center text-[10px] font-mono text-zinc-400 px-1">
        <span>00:00.00</span>
        <span className="text-[9px] text-zinc-400 uppercase tracking-tight flex items-center gap-1">
          <Clock className="w-2.5 h-2.5" />
          <span>Click track or drag needle to scrub • Click snap pins to jump</span>
        </span>
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  );
};

export default VideoTimeline;

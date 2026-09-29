import React, { useState, useMemo } from 'react';
import {
  Film,
  Play,
  Pause,
  Download,
  Clock,
  Sparkles,
  User,
  Dog,
  Eye,
  Calendar,
  AlertCircle,
  Maximize2,
  Trash2,
  X,
} from 'lucide-react';
import { MotionAlertEvent, RecordedClip } from '../types';

interface DVRTimelineProps {
  motionEvents: MotionAlertEvent[];
  recordedClips: RecordedClip[];
  onSelectEvent: (event: MotionAlertEvent) => void;
  onSelectClip?: (clip: RecordedClip) => void;
  onClose?: () => void;
}

export const DVRTimeline: React.FC<DVRTimelineProps> = ({
  motionEvents,
  recordedClips,
  onSelectEvent,
  onSelectClip,
  onClose,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'person' | 'pet' | 'high_motion'>('all');
  const [activeClip, setActiveClip] = useState<RecordedClip | null>(
    recordedClips.length > 0 ? recordedClips[0] : null
  );
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Filtered motion events
  const filteredEvents = useMemo(() => {
    return motionEvents.filter((ev) => {
      if (selectedFilter === 'all') return true;
      if (selectedFilter === 'person') return ev.aiAnalysis?.category === 'person';
      if (selectedFilter === 'pet') return ev.aiAnalysis?.category === 'pet';
      if (selectedFilter === 'high_motion') return ev.motionScore >= 50;
      return true;
    });
  }, [motionEvents, selectedFilter]);

  // Generate 24-hour markers for the scrubber bar
  const currentHour = new Date().getHours();
  const timelineHours = useMemo(() => {
    const hours = [];
    for (let i = 12; i >= 0; i--) {
      const h = (currentHour - i + 24) % 24;
      hours.push(h);
    }
    return hours;
  }, [currentHour]);

  const handleDownloadClip = (clip: RecordedClip) => {
    const a = document.createElement('a');
    a.href = clip.blobUrl;
    a.download = `ayasec_clip_${clip.cameraName}_${new Date(clip.timestamp).toISOString().slice(0, 19)}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col text-slate-100">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
            <Film className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base text-white">DVR Event Timeline & Recordings</h3>
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 rounded-full border border-emerald-500/30">
                NVR Ready
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {recordedClips.length} video clips &bull; {filteredEvents.length} motion detections
            </p>
          </div>
        </div>

        {/* Filter buttons & close */}
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setSelectedFilter('all')}
              className={`px-3 py-1 rounded-lg font-medium transition ${
                selectedFilter === 'all'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setSelectedFilter('person')}
              className={`px-3 py-1 rounded-lg font-medium transition flex items-center gap-1.5 ${
                selectedFilter === 'person'
                  ? 'bg-rose-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <User className="w-3.5 h-3.5" /> Person
            </button>
            <button
              onClick={() => setSelectedFilter('pet')}
              className={`px-3 py-1 rounded-lg font-medium transition flex items-center gap-1.5 ${
                selectedFilter === 'pet'
                  ? 'bg-cyan-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Dog className="w-3.5 h-3.5" /> Pet
            </button>
            <button
              onClick={() => setSelectedFilter('high_motion')}
              className={`px-3 py-1 rounded-lg font-medium transition flex items-center gap-1.5 ${
                selectedFilter === 'high_motion'
                  ? 'bg-amber-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <AlertCircle className="w-3.5 h-3.5" /> 50%+
            </button>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Visual Scrubber Bar */}
      <div className="px-5 py-4 bg-slate-950 border-b border-slate-800/80">
        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
          <span className="flex items-center gap-1.5 font-medium">
            <Clock className="w-3.5 h-3.5 text-indigo-400" /> Recent Activity Scrubber
          </span>
          <span className="text-slate-500">Click a marker to inspect snapshot or video clip</span>
        </div>

        {/* Timeline Bar with Markers */}
        <div className="relative h-10 bg-slate-900 rounded-xl border border-slate-800 flex items-center px-4 overflow-hidden">
          {/* Hour tick marks */}
          <div className="absolute inset-0 flex justify-between px-3 pointer-events-none opacity-40">
            {timelineHours.map((h, idx) => (
              <div key={idx} className="flex flex-col items-center justify-center">
                <div className="h-2 w-px bg-slate-600"></div>
                <span className="text-[9px] text-slate-400 mt-1 font-mono">{h}:00</span>
              </div>
            ))}
          </div>

          {/* Event markers on timeline */}
          <div className="relative w-full h-full flex items-center">
            {filteredEvents.slice(0, 40).map((ev, i) => {
              const ageMinutes = (Date.now() - ev.timestamp) / 60000;
              const maxMinutes = 12 * 60;
              const percent = Math.max(2, Math.min(98, 100 - (ageMinutes / maxMinutes) * 100));

              const isPerson = ev.aiAnalysis?.category === 'person';
              const isPet = ev.aiAnalysis?.category === 'pet';

              let pinColor = 'bg-amber-400 border-amber-300';
              if (isPerson) pinColor = 'bg-rose-500 border-rose-300';
              if (isPet) pinColor = 'bg-cyan-400 border-cyan-200';

              return (
                <button
                  key={ev.id || i}
                  onClick={() => onSelectEvent(ev)}
                  title={`${ev.cameraName} at ${new Date(ev.timestamp).toLocaleTimeString()}: ${
                    ev.aiAnalysis?.summary || `${ev.motionScore}% motion`
                  }`}
                  style={{ left: `${percent}%` }}
                  className={`absolute -translate-x-1/2 w-3.5 h-7 rounded-full border-2 ${pinColor} shadow-lg transition hover:scale-125 z-10`}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content: Active Clip Player & Clips List */}
      <div className="p-5 grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Active Player (7 cols) */}
        <div className="lg:col-span-7 bg-slate-950 rounded-xl border border-slate-800 p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Play className="w-3.5 h-3.5 text-indigo-400" />
                {activeClip ? 'DVR Video Clip Playback' : 'Snapshot Preview'}
              </span>
              {activeClip && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Speed:</span>
                  {[1, 2, 4].map((spd) => (
                    <button
                      key={spd}
                      onClick={() => setPlaybackSpeed(spd)}
                      className={`px-2 py-0.5 rounded text-xs font-mono font-bold transition ${
                        playbackSpeed === spd
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {spd}x
                    </button>
                  ))}
                  <button
                    onClick={() => handleDownloadClip(activeClip)}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition"
                    title="Download Clip"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            <div className="aspect-video bg-black rounded-lg overflow-hidden relative flex items-center justify-center border border-slate-800/80">
              {activeClip ? (
                <video
                  ref={(el) => {
                    if (el) el.playbackRate = playbackSpeed;
                  }}
                  src={activeClip.blobUrl}
                  controls
                  autoPlay
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  className="w-full h-full object-contain"
                />
              ) : filteredEvents.length > 0 && filteredEvents[0].snapshot ? (
                <div className="relative w-full h-full">
                  <img
                    src={filteredEvents[0].snapshot}
                    alt="Event snapshot"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-4">
                    <p className="text-xs font-bold text-white">
                      {filteredEvents[0].cameraName} &bull;{' '}
                      {new Date(filteredEvents[0].timestamp).toLocaleTimeString()}
                    </p>
                    <p className="text-[11px] text-slate-300">
                      {filteredEvents[0].aiAnalysis?.summary || 'Motion event detected'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center p-6 text-slate-500">
                  <Film className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-xs">No video clips recorded yet.</p>
                  <p className="text-[11px] text-slate-600">
                    Enable "Auto-Record Clips on Motion" or press record on a live camera.
                  </p>
                </div>
              )}
            </div>
          </div>

          {activeClip && (
            <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <div>
                <span className="font-semibold text-white">{activeClip.cameraName}</span> &bull;{' '}
                <span>{new Date(activeClip.timestamp).toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-emerald-400 font-bold">{activeClip.durationSeconds}s duration</span>
                {activeClip.aiCategory && (
                  <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded text-[10px] font-semibold uppercase">
                    {activeClip.aiCategory}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Clips & Events Feed (5 cols) */}
        <div className="lg:col-span-5 flex flex-col h-[340px]">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Recorded Clips & Events List
          </span>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {/* Recorded video clips */}
            {recordedClips.map((clip) => {
              const isSelected = activeClip?.id === clip.id;
              return (
                <div
                  key={clip.id}
                  onClick={() => {
                    setActiveClip(clip);
                    onSelectClip?.(clip);
                  }}
                  className={`p-2.5 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                    isSelected
                      ? 'bg-indigo-950/60 border-indigo-500/60 shadow-md'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-950'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-9 bg-slate-900 rounded-lg border border-slate-800 flex items-center justify-center text-indigo-400 shrink-0 relative overflow-hidden">
                      {clip.thumbnailUrl ? (
                        <img src={clip.thumbnailUrl} className="w-full h-full object-cover" />
                      ) : (
                        <Film className="w-4 h-4" />
                      )}
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <Play className="w-3.5 h-3.5 text-white" />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-xs text-white truncate max-w-[120px]">
                          {clip.cameraName}
                        </h4>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {clip.durationSeconds}s
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        {new Date(clip.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {clip.aiCategory && (
                      <span className="px-2 py-0.5 text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 rounded border border-indigo-500/30">
                        {clip.aiCategory}
                      </span>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownloadClip(clip);
                      }}
                      className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
                      title="Download clip"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Motion snapshots */}
            {filteredEvents.map((ev) => {
              const isPerson = ev.aiAnalysis?.category === 'person';
              const isPet = ev.aiAnalysis?.category === 'pet';

              return (
                <div
                  key={ev.id}
                  onClick={() => onSelectEvent(ev)}
                  className="p-2.5 rounded-xl border border-slate-800/80 bg-slate-950/40 hover:bg-slate-950 hover:border-slate-700 cursor-pointer transition flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-9 bg-slate-900 rounded-lg border border-slate-800 overflow-hidden relative shrink-0">
                      {ev.snapshot ? (
                        <img src={ev.snapshot} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-600">
                          <Eye className="w-4 h-4" />
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-slate-200">{ev.cameraName}</span>
                        <span className="text-[10px] text-amber-400 font-mono font-semibold">
                          {ev.motionScore}%
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate max-w-[140px]">
                        {ev.aiAnalysis?.summary || new Date(ev.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>

                  {ev.aiAnalysis && (
                    <span
                      className={`px-2 py-0.5 text-[10px] font-semibold rounded border ${
                        isPerson
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                          : isPet
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      {ev.aiAnalysis.category}
                    </span>
                  )}
                </div>
              );
            })}

            {recordedClips.length === 0 && filteredEvents.length === 0 && (
              <div className="text-center py-10 text-slate-500 text-xs">
                No events found matching this filter.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

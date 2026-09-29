import React, { useRef, useEffect } from 'react';
import {
  Video,
  VideoOff,
  Battery,
  BatteryCharging,
  Maximize2,
  Flashlight,
  Volume2,
  ShieldAlert,
  Camera,
  Eye,
  Lock,
} from 'lucide-react';
import { DeviceInfo, DisplayFilterMode } from '../types';

interface MultiCameraGridProps {
  cameras: DeviceInfo[];
  remoteStreams: Record<string, MediaStream>;
  remoteFrames: Record<string, { frame: string; timestamp: number; motionScore: number }>;
  displayFilter: DisplayFilterMode;
  onSelectCamera: (deviceId: string) => void;
  onToggleTorch: (deviceId: string, currentTorch?: boolean) => void;
  onToggleSiren: (deviceId: string) => void;
  onSnapshot: (deviceId: string) => void;
}

export const MultiCameraGrid: React.FC<MultiCameraGridProps> = ({
  cameras,
  remoteStreams,
  remoteFrames,
  displayFilter,
  onSelectCamera,
  onToggleTorch,
  onToggleSiren,
  onSnapshot,
}) => {
  // CSS filter map for Night Vision modes
  const filterStyles: Record<DisplayFilterMode, string> = {
    normal: '',
    night_vision_ir: 'brightness(1.2) contrast(1.5) hue-rotate(90deg) saturate(1.8)',
    high_contrast_bw: 'grayscale(100%) contrast(1.8) brightness(1.1)',
    thermal_cam: 'contrast(1.6) invert(80%) hue-rotate(180deg) saturate(2)',
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {cameras.map((cam) => {
        const stream = remoteStreams[cam.deviceId];
        const frameData = remoteFrames[cam.deviceId];
        const hasLiveVideo = !!stream || !!frameData?.frame;
        const isShutterActive = !!cam.privacyShutter;

        return (
          <div
            key={cam.deviceId}
            className="group relative bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg hover:border-indigo-500/50 transition-all flex flex-col"
          >
            {/* Top Bar on Tile */}
            <div className="absolute top-0 inset-x-0 z-20 p-3 bg-gradient-to-b from-black/80 via-black/40 to-transparent flex items-center justify-between text-xs text-white">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-bold drop-shadow">{cam.name}</span>
              </div>

              <div className="flex items-center gap-2">
                {cam.batteryLevel !== undefined && (
                  <span className="flex items-center gap-1 bg-black/60 backdrop-blur px-2 py-0.5 rounded-md text-[10px] font-mono text-slate-300">
                    {cam.isCharging ? (
                      <BatteryCharging className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Battery className="w-3 h-3" />
                    )}
                    {cam.batteryLevel}%
                  </span>
                )}
                {frameData && frameData.motionScore > 10 && (
                  <span className="bg-amber-500/80 px-1.5 py-0.5 rounded text-[10px] font-bold text-black animate-bounce">
                    {frameData.motionScore}%
                  </span>
                )}
              </div>
            </div>

            {/* Video Viewport */}
            <div className="aspect-video w-full bg-slate-950 relative flex items-center justify-center overflow-hidden">
              {isShutterActive ? (
                <div className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center text-slate-500 p-4 text-center z-10">
                  <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-amber-400 mb-2">
                    <Lock className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-bold text-white uppercase tracking-wider">
                    Privacy Shutter Active
                  </p>
                  <p className="text-[11px] text-slate-400">Video feed muted by camera operator</p>
                </div>
              ) : stream ? (
                <TileVideoPlayer stream={stream} filterStyle={filterStyles[displayFilter]} />
              ) : frameData?.frame ? (
                <img
                  src={frameData.frame}
                  alt={cam.name}
                  style={{ filter: filterStyles[displayFilter] }}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center p-6 text-slate-600">
                  <VideoOff className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-xs text-slate-400">Waiting for video stream...</p>
                </div>
              )}

              {/* Display mode indicator badge */}
              {displayFilter !== 'normal' && !isShutterActive && (
                <div className="absolute bottom-2 left-2 z-20 px-2 py-0.5 bg-black/70 backdrop-blur rounded text-[9px] font-mono uppercase tracking-wider text-emerald-400 border border-emerald-500/30">
                  {displayFilter.replace(/_/g, ' ')}
                </div>
              )}
            </div>

            {/* Action Bar */}
            <div className="p-3 bg-slate-900/90 border-t border-slate-800/80 flex items-center justify-between">
              <button
                onClick={() => onSelectCamera(cam.deviceId)}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <Maximize2 className="w-3.5 h-3.5" /> Focus View
              </button>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onSnapshot(cam.deviceId)}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition"
                  title="Take Snapshot"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onToggleTorch(cam.deviceId, cam.torchOn)}
                  className={`p-1.5 rounded-lg transition ${
                    cam.torchOn
                      ? 'bg-amber-500 text-black'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white'
                  }`}
                  title="Flashlight Torch"
                >
                  <Flashlight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onToggleSiren(cam.deviceId)}
                  className="p-1.5 bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white rounded-lg transition"
                  title="Sound Siren Alert"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const TileVideoPlayer: React.FC<{ stream: MediaStream; filterStyle?: string }> = ({
  stream,
  filterStyle,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted
      style={{ filter: filterStyle }}
      className="w-full h-full object-cover"
    />
  );
};

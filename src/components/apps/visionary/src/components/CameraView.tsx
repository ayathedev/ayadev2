import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  VideoOff,
  Mic,
  MicOff,
  SwitchCamera,
  Flashlight,
  FlashlightOff,
  Activity,
  Moon,
  Sun,
  ShieldAlert,
  Battery,
  BatteryCharging,
  QrCode,
  Volume2,
  Lock,
  Unlock,
  Radio,
  Eye,
  Settings2,
  X,
} from 'lucide-react';
import { CameraSettings, DeviceInfo, SpaceConfig } from '../types';
import { useCameraStream } from '../hooks/useCameraStream';
import { playSiren, stopSiren, playMotionChime } from '../utils/audio';

interface CameraViewProps {
  spaceConfig: SpaceConfig;
  devices: DeviceInfo[];
  sendFrame: (frameBase64: string, motionScore: number) => void;
  sendMotionAlert: (motionScore: number, snapshotBase64?: string) => void;
  updateDeviceStatus: (updates: Partial<DeviceInfo>) => void;
  onOpenPairQR: () => void;
  remoteCommandSignal?: { command: string; value?: any; fromDeviceId?: string; timestamp: number } | null;
  intercomAudioSignal?: { audioData: string; fromDeviceId?: string; timestamp: number } | null;
  onSaveRecordedClip?: (clipData: any) => void;
  togglePrivacyShutter?: (enabled: boolean) => void;
}

export const CameraView: React.FC<CameraViewProps> = ({
  spaceConfig,
  devices,
  sendFrame,
  sendMotionAlert,
  updateDeviceStatus,
  onOpenPairQR,
  remoteCommandSignal,
  intercomAudioSignal,
  onSaveRecordedClip,
  togglePrivacyShutter,
}) => {
  const [settings, setSettings] = useState<CameraSettings>({
    motionDetection: true,
    motionSensitivity: spaceConfig.motionSensitivity ?? 50,
    localAlarmOnMotion: false,
    stealthMode: false,
    facingMode: 'environment',
    torchEnabled: false,
    audioMuted: false,
    streamFps: 12,
    streamQuality: 0.6,
    privacyShutter: false,
    displayFilter: 'normal',
    autoRecordClips: true,
  });

  // Keep motion sensitivity synced if spaceConfig updates
  useEffect(() => {
    if (typeof spaceConfig.motionSensitivity === 'number') {
      setSettings((s) => ({ ...s, motionSensitivity: spaceConfig.motionSensitivity! }));
    }
  }, [spaceConfig.motionSensitivity]);

  const [showSettingsDrawer, setShowSettingsDrawer] = useState(false);
  const [isSirenActive, setIsSirenActive] = useState(false);
  const [intercomActive, setIntercomActive] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  const viewers = devices.filter((d) => d.role === 'viewer');
  const stopSirenRef = useRef<(() => void) | null>(null);

  // Time ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleMotionDetected = useCallback((score: number, snapshot: string) => {
    sendMotionAlert(score, snapshot);

    if (settings.localAlarmOnMotion && !isSirenActive) {
      triggerSiren(3000);
    } else {
      playMotionChime();
    }
  }, [sendMotionAlert, settings.localAlarmOnMotion, isSirenActive]);

  const handleFrameCapture = useCallback((frameBase64: string, motionScore: number) => {
    sendFrame(frameBase64, motionScore);
  }, [sendFrame]);

  const {
    stream,
    error,
    videoRef,
    facingMode,
    switchCamera,
    hasTorch,
    torchOn,
    toggleTorch,
    isMuted,
    toggleMute,
    currentMotionLevel,
    batteryLevel,
    isCharging,
    retry,
  } = useCameraStream({
    settings,
    isActive: true,
    onMotionDetected: handleMotionDetected,
    onFrameCapture: handleFrameCapture,
  });

  // Attach stream to video element
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, videoRef]);

  // Push status updates to space
  useEffect(() => {
    updateDeviceStatus({
      status: 'streaming',
      facingMode,
      torchOn,
      batteryLevel,
      isCharging,
      fps: settings.streamFps,
      resolution: '720p',
    });
  }, [facingMode, torchOn, batteryLevel, isCharging, settings.streamFps, updateDeviceStatus]);

  // Handle remote commands from viewers
  useEffect(() => {
    if (!remoteCommandSignal) return;
    const { command, value } = remoteCommandSignal;

    if (command === 'siren') {
      triggerSiren(5000);
    } else if (command === 'stop_siren') {
      haltSiren();
    } else if (command === 'torch') {
      if (hasTorch) toggleTorch();
    } else if (command === 'stealth') {
      setSettings((s) => ({ ...s, stealthMode: !s.stealthMode }));
    } else if (command === 'switch_cam') {
      switchCamera();
    } else if (command === 'set_motion_sensitivity') {
      if (typeof value === 'number' && value >= 1 && value <= 100) {
        setSettings((s) => ({ ...s, motionSensitivity: value }));
      }
    }
  }, [remoteCommandSignal, hasTorch, toggleTorch, switchCamera]);

  // Handle incoming intercom audio from viewer
  useEffect(() => {
    if (!intercomAudioSignal) return;
    try {
      const audio = new Audio(intercomAudioSignal.audioData);
      setIntercomActive(true);
      audio.play().catch((e) => console.warn('Audio play prevented:', e));
      audio.onended = () => setIntercomActive(false);
    } catch (e) {
      console.error('Failed to play intercom audio on camera:', e);
      setIntercomActive(false);
    }
  }, [intercomAudioSignal]);

  // Trigger siren
  const triggerSiren = (durationMs = 4000) => {
    if (isSirenActive) return;
    setIsSirenActive(true);
    const stopFn = playSiren(durationMs);
    stopSirenRef.current = stopFn;
    setTimeout(() => {
      setIsSirenActive(false);
      stopSirenRef.current = null;
    }, durationMs);
  };

  const haltSiren = () => {
    if (stopSirenRef.current) {
      stopSirenRef.current();
      stopSirenRef.current = null;
    }
    stopSiren();
    setIsSirenActive(false);
  };

  const handleTogglePrivacyShutter = useCallback((enabled: boolean) => {
    setSettings((s) => ({ ...s, privacyShutter: enabled }));
    updateDeviceStatus({ privacyShutter: enabled });
    if (togglePrivacyShutter) togglePrivacyShutter(enabled);
  }, [togglePrivacyShutter, updateDeviceStatus]);

  // Handle remote commands from viewers
  useEffect(() => {
    if (!remoteCommandSignal) return;
    const { command, value } = remoteCommandSignal;

    if (command === 'siren') {
      triggerSiren(5000);
    } else if (command === 'stop_siren') {
      haltSiren();
    } else if (command === 'torch') {
      if (hasTorch) toggleTorch();
    } else if (command === 'stealth') {
      setSettings((s) => ({ ...s, stealthMode: !s.stealthMode }));
    } else if (command === 'switch_cam') {
      switchCamera();
    } else if (command === 'set_motion_sensitivity') {
      if (typeof value === 'number' && value >= 1 && value <= 100) {
        setSettings((s) => ({ ...s, motionSensitivity: value }));
      }
    } else if (command === 'toggle_privacy_shutter') {
      handleTogglePrivacyShutter(!!value);
    }
  }, [remoteCommandSignal, hasTorch, toggleTorch, switchCamera, handleTogglePrivacyShutter]);
  if (settings.stealthMode) {
    return (
      <div
        onClick={() => setSettings((s) => ({ ...s, stealthMode: false }))}
        className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-between p-8 text-neutral-800 cursor-pointer select-none"
      >
        <div className="text-[11px] font-mono tracking-widest uppercase">
          RECORDING ACTIVE • STEALTH MODE
        </div>
        <div className="text-center space-y-2">
          <div className="w-2 h-2 rounded-full bg-red-900/40 animate-pulse mx-auto" />
          <p className="text-xs text-neutral-700">Display blanked to conserve battery</p>
          <p className="text-[11px] text-neutral-800">Tap anywhere to wake display</p>
        </div>
        <div className="text-[10px] font-mono text-neutral-800">
          {spaceConfig.name} • {currentTime}
        </div>
        {/* Invisible video tag so stream stays running */}
        <video ref={videoRef} autoPlay playsInline muted className="hidden" />
      </div>
    );
  }

  return (
    <div className="flex-1 w-full min-h-[calc(100vh-62px)] bg-slate-100 flex flex-col justify-between relative overflow-hidden">
      {/* Intercom Receiving Banner */}
      {intercomActive && (
        <div className="absolute top-3 inset-x-4 z-40 p-2.5 rounded-lg bg-emerald-600 text-white shadow-md flex items-center justify-center gap-2 font-medium text-xs">
          <Volume2 className="w-4 h-4 animate-bounce" />
          <span>Intercom Active: Receiving audio from Viewer</span>
        </div>
      )}

      {/* Siren Alert Banner */}
      {isSirenActive && (
        <div className="absolute top-14 inset-x-4 z-40 p-2.5 rounded-lg bg-rose-600 text-white shadow-md flex items-center justify-between font-mono text-xs">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4" />
            <span className="font-bold">SIREN ALARM ACTIVATED</span>
          </div>
          <button
            onClick={haltSiren}
            className="px-2.5 py-1 rounded bg-white text-rose-700 font-bold text-xs"
          >
            Mute
          </button>
        </div>
      )}

      {/* Camera Viewfinder Video */}
      <div className="relative flex-1 w-full h-full flex items-center justify-center bg-slate-950 overflow-hidden">
        {settings.privacyShutter ? (
          <div className="absolute inset-0 z-30 bg-slate-950 flex flex-col items-center justify-center p-6 text-center text-slate-100">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 mb-3 animate-pulse">
              <Lock className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-white uppercase tracking-wider mb-1">
              Privacy Shutter Active
            </h3>
            <p className="text-xs text-slate-400 max-w-xs mb-4">
              Camera sensor and video streaming blackout engaged.
            </p>
            <button
              onClick={() => handleTogglePrivacyShutter(false)}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded-xl transition flex items-center gap-1.5"
            >
              <Unlock className="w-4 h-4" /> Open Shutter
            </button>
          </div>
        ) : error ? (
          <div className="max-w-md p-6 rounded-xl bg-white border border-slate-200 text-center text-slate-800 m-4 shadow-sm">
            <VideoOff className="w-10 h-10 text-rose-600 mx-auto mb-2" />
            <h3 className="font-bold text-slate-900 text-sm mb-1">Camera Permission Required</h3>
            <p className="text-xs text-slate-500 mb-3">{error}</p>
            <button
              onClick={retry}
              className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition"
            >
              Retry Camera Access
            </button>
          </div>
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        )}

        {/* Viewfinder Safe Frame Guides */}
        <div className="absolute inset-4 pointer-events-none border border-white/15 rounded-lg">
          <div className="absolute top-4 left-4 w-6 h-6 border-t border-l border-white/40" />
          <div className="absolute top-4 right-4 w-6 h-6 border-t border-r border-white/40" />
          <div className="absolute bottom-4 left-4 w-6 h-6 border-b border-l border-white/40" />
          <div className="absolute bottom-4 right-4 w-6 h-6 border-b border-r border-white/40" />
        </div>

        {/* Top HUD Bar */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-auto">
          {/* Status badge */}
          <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-black/60 backdrop-blur-xs border border-white/10 text-white text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <span className="font-bold tracking-wider uppercase text-[10px]">
              BROADCASTING
            </span>
            <div className="h-3 w-px bg-white/20" />
            <span className="text-white/80 text-[11px]">{currentTime}</span>
          </div>

          {/* Viewers & Battery */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-black/60 backdrop-blur-xs border border-white/10 text-white text-xs font-mono">
              <Eye className="w-3.5 h-3.5 text-white/80" />
              <span>{viewers.length} {viewers.length === 1 ? 'Viewer' : 'Viewers'}</span>
            </div>

            {batteryLevel !== undefined && (
              <div className="flex items-center gap-1 px-2.5 py-1 rounded bg-black/60 backdrop-blur-xs border border-white/10 text-white text-xs font-mono">
                {isCharging ? (
                  <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Battery className="w-3.5 h-3.5 text-white/80" />
                )}
                <span>{batteryLevel}%</span>
              </div>
            )}
          </div>
        </div>

        {/* Motion Level Activity Gauge */}
        {settings.motionDetection && (
          <div className="absolute bottom-4 left-4 z-20 px-3 py-2 rounded bg-black/60 backdrop-blur-xs border border-white/10 text-white font-mono pointer-events-auto">
            <div className="flex items-center justify-between gap-3 text-[10px] text-white/70 mb-1">
              <span className="flex items-center gap-1 font-semibold uppercase">
                <Activity className="w-3 h-3 text-white" />
                Motion Level
              </span>
              <span>{currentMotionLevel}%</span>
            </div>
            <div className="w-32 h-1.5 rounded-full bg-white/20 overflow-hidden">
              <div
                className={`h-full transition-all duration-150 ${
                  currentMotionLevel > 40
                    ? 'bg-rose-500'
                    : currentMotionLevel > 15
                    ? 'bg-amber-400'
                    : 'bg-emerald-400'
                }`}
                style={{ width: `${Math.min(currentMotionLevel, 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Bottom Camera Control Dock */}
      <div className="relative z-30 bg-white border-t border-slate-200 px-4 py-3 flex items-center justify-between gap-2 shadow-xs">
        {/* Left Controls */}
        <div className="flex items-center gap-2">
          {/* Stealth Mode */}
          <button
            onClick={() => setSettings((s) => ({ ...s, stealthMode: true }))}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-medium transition"
            title="Black screen to conserve battery and reduce heat"
          >
            <Moon className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden sm:inline">Stealth Mode</span>
          </button>

          {/* Switch Camera */}
          <button
            onClick={switchCamera}
            className="p-2 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition"
            title={`Switch to ${facingMode === 'user' ? 'Rear' : 'Front'} Camera`}
          >
            <SwitchCamera className="w-3.5 h-3.5" />
          </button>

          {/* Flashlight/Torch */}
          {hasTorch && (
            <button
              onClick={toggleTorch}
              className={`p-2 rounded-lg border transition ${
                torchOn
                  ? 'bg-amber-100 border-amber-300 text-amber-900'
                  : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
              }`}
              title="Toggle Flashlight"
            >
              {torchOn ? <Flashlight className="w-3.5 h-3.5" /> : <FlashlightOff className="w-3.5 h-3.5" />}
            </button>
          )}

          {/* Mute Mic */}
          <button
            onClick={toggleMute}
            className={`p-2 rounded-lg border transition ${
              isMuted
                ? 'bg-rose-50 border-rose-300 text-rose-700'
                : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
            title={isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
          >
            {isMuted ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
          </button>

          {/* Privacy Shutter Button */}
          <button
            onClick={() => handleTogglePrivacyShutter(!settings.privacyShutter)}
            className={`p-2 rounded-lg border transition ${
              settings.privacyShutter
                ? 'bg-amber-500 text-black border-amber-600 font-bold'
                : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
            title={settings.privacyShutter ? 'Open Privacy Shutter' : 'Engage Privacy Shutter (Blackout)'}
          >
            {settings.privacyShutter ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Center Siren Test */}
        <div>
          {isSirenActive ? (
            <button
              onClick={haltSiren}
              className="px-3 py-2 rounded-lg bg-rose-600 text-white text-xs font-bold uppercase"
            >
              Stop Siren
            </button>
          ) : (
            <button
              onClick={() => triggerSiren(4000)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-slate-300 text-rose-700 hover:bg-rose-50 text-xs font-medium transition"
              title="Test Alarm Siren"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
              <span>Test Siren</span>
            </button>
          )}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenPairQR}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition"
            title="Scan QR to pair a Viewer on your computer or phone"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Pair Viewer</span>
          </button>

          <button
            onClick={() => setShowSettingsDrawer(!showSettingsDrawer)}
            className="p-2 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition"
            title="Camera Settings"
          >
            <Settings2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Settings Drawer */}
      {showSettingsDrawer && (
        <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-80 bg-white border-l border-slate-200 shadow-xl p-5 flex flex-col text-slate-900 text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <h3 className="font-semibold text-sm text-slate-900">Camera Settings</h3>
            <button
              onClick={() => setShowSettingsDrawer(false)}
              className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="py-4 space-y-4 flex-1 overflow-y-auto">
            {/* Motion Detection Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium text-slate-800 block">Motion Detection</span>
                <span className="text-[11px] text-slate-500">Analyze video frames for movement</span>
              </div>
              <input
                type="checkbox"
                checked={settings.motionDetection}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, motionDetection: e.target.checked }))
                }
                className="w-4 h-4 accent-slate-900"
              />
            </div>

            {/* Sensitivity Slider */}
            {settings.motionDetection && (
              <div>
                <div className="flex items-center justify-between mb-1 text-[11px] text-slate-600 font-medium">
                  <span>Sensitivity</span>
                  <span className="font-mono">{settings.motionSensitivity}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="90"
                  value={settings.motionSensitivity}
                  onChange={(e) =>
                    setSettings((s) => ({ ...s, motionSensitivity: Number(e.target.value) }))
                  }
                  className="w-full accent-slate-900"
                />
              </div>
            )}

            {/* Local Alarm on Motion */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <div>
                <span className="font-medium text-slate-800 block">Alarm Siren on Motion</span>
                <span className="text-[11px] text-slate-500">Blast alarm on this phone when motion occurs</span>
              </div>
              <input
                type="checkbox"
                checked={settings.localAlarmOnMotion}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, localAlarmOnMotion: e.target.checked }))
                }
                className="w-4 h-4 accent-slate-900"
              />
            </div>

            {/* Target FPS */}
            <div className="pt-2 border-t border-slate-100">
              <label className="font-medium text-slate-800 block mb-1.5">Stream Framerate</label>
              <div className="grid grid-cols-3 gap-2">
                {[8, 12, 20].map((fps) => (
                  <button
                    key={fps}
                    onClick={() => setSettings((s) => ({ ...s, streamFps: fps }))}
                    className={`py-1.5 rounded-md border text-center font-medium transition ${
                      settings.streamFps === fps
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {fps} FPS
                  </button>
                ))}
              </div>
            </div>

            {/* Quality Compression */}
            <div className="pt-2 border-t border-slate-100">
              <label className="font-medium text-slate-800 block mb-1.5">Image Quality</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Low', val: 0.4 },
                  { label: 'Standard', val: 0.6 },
                  { label: 'High', val: 0.8 },
                ].map((q) => (
                  <button
                    key={q.val}
                    onClick={() => setSettings((s) => ({ ...s, streamQuality: q.val }))}
                    className={`py-1.5 rounded-md border text-center font-medium transition ${
                      settings.streamQuality === q.val
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {q.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

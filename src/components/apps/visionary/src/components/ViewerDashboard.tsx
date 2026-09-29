import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Video,
  Eye,
  ShieldAlert,
  Mic,
  Camera,
  Maximize2,
  Minimize2,
  Flashlight,
  Moon,
  Download,
  AlertTriangle,
  Radio,
  QrCode,
  Battery,
  BatteryCharging,
  Square,
  Play,
  X,
  RefreshCw,
  ArrowRight,
  Volume2,
  VolumeX,
  Wifi,
  Zap,
  SlidersHorizontal,
  Info,
  Film,
  Sparkles,
  Share2,
  FileText,
  LayoutGrid,
  Bell,
  BellOff,
  Shield,
  ShieldCheck,
  Lock,
  Unlock,
  User,
  Dog,
  Car,
  Package,
} from 'lucide-react';
import {
  DeviceInfo,
  MotionAlertEvent,
  SpaceConfig,
  ConnectionQuality,
  TransportMode,
  SystemSecurityMode,
  DisplayFilterMode,
  RecordedClip,
  AuditLogEntry,
  AIEventAnalysis,
} from '../types';
import { playIntercomBeep } from '../utils/audio';
import { DVRTimeline } from './DVRTimeline';
import { ShareAccessModal } from './ShareAccessModal';
import { AuditLogModal } from './AuditLogModal';
import { MultiCameraGrid } from './MultiCameraGrid';
import { usePushNotifications } from '../hooks/usePushNotifications';

interface ActiveSpaceItem {
  spaceId: string;
  name: string;
  accessCode: string;
  deviceCount: number;
  devices: { deviceId: string; name: string; role: 'camera' | 'viewer'; status: string }[];
}

interface ViewerDashboardProps {
  spaceConfig: SpaceConfig;
  devices: DeviceInfo[];
  remoteFrames: Record<string, { frame: string; timestamp: number; motionScore: number }>;
  remoteStreams: Record<string, MediaStream>;
  motionEvents: MotionAlertEvent[];
  latencyMs?: number | null;
  transportMode?: TransportMode;
  connectionQuality?: ConnectionQuality;
  securityMode?: SystemSecurityMode;
  recordedClips?: RecordedClip[];
  auditLogs?: AuditLogEntry[];
  onChangeSecurityMode?: (mode: SystemSecurityMode) => void;
  onSaveRecordedClip?: (clipData: any) => void;
  onTogglePrivacyShutter?: (enabled: boolean) => void;
  onRefreshAuditLogs?: () => void;
  onRefreshRecordings?: () => void;
  sendRemoteCommand: (targetDeviceId: string, command: string, value?: any) => void;
  sendIntercomAudio: (targetDeviceId: string, audioData: string) => void;
  onRefreshStream?: (deviceId?: string) => void;
  onOpenPairQR: () => void;
  onSwitchToCamera: () => void;
  onSwitchSpace?: (spaceId: string, name: string, code?: string) => void;
  onOpenSpaceModal?: () => void;
  onUpdateMotionSensitivity?: (sensitivity: number) => void;
}

export const ViewerDashboard: React.FC<ViewerDashboardProps> = ({
  spaceConfig,
  devices,
  remoteFrames,
  remoteStreams,
  motionEvents,
  latencyMs,
  transportMode = 'connecting',
  connectionQuality = 'good',
  securityMode = 'disarmed',
  recordedClips = [],
  auditLogs = [],
  onChangeSecurityMode,
  onSaveRecordedClip,
  onTogglePrivacyShutter,
  onRefreshAuditLogs,
  onRefreshRecordings,
  sendRemoteCommand,
  sendIntercomAudio,
  onRefreshStream,
  onOpenPairQR,
  onSwitchToCamera,
  onSwitchSpace,
  onOpenSpaceModal,
  onUpdateMotionSensitivity,
}) => {
  const [selectedCameraId, setSelectedCameraId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'focus' | 'grid'>('focus');
  const [displayFilter, setDisplayFilter] = useState<DisplayFilterMode>('normal');
  const [isTalking, setIsTalking] = useState(false);
  const [talkingToDeviceId, setTalkingToDeviceId] = useState<string | null>(null);
  const [recordingDeviceId, setRecordingDeviceId] = useState<string | null>(null);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [activeSirenDeviceId, setActiveSirenDeviceId] = useState<string | null>(null);
  const [showAlertsDrawer, setShowAlertsDrawer] = useState(false);
  const [showDVR, setShowDVR] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [selectedSnapshot, setSelectedSnapshot] = useState<MotionAlertEvent | null>(null);
  const [analyzingEventId, setAnalyzingEventId] = useState<string | null>(null);
  const [analyzedEvents, setAnalyzedEvents] = useState<Record<string, AIEventAnalysis>>({});
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [osdTime, setOsdTime] = useState(new Date().toLocaleTimeString());
  const [discoveredSpaces, setDiscoveredSpaces] = useState<ActiveSpaceItem[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);

  // Push notifications
  const { isGranted: isPushGranted, requestPermission, sendPushAlert } = usePushNotifications();

  const handleTogglePush = async () => {
    if (!pushEnabled) {
      const granted = await requestPermission();
      if (granted) {
        setPushEnabled(true);
      }
    } else {
      setPushEnabled(false);
    }
  };

  // Trigger push alert on new motion detection when armed
  useEffect(() => {
    if (motionEvents.length > 0 && pushEnabled && (securityMode === 'home' || securityMode === 'away')) {
      const latest = motionEvents[0];
      const isFresh = Date.now() - latest.timestamp < 4000;
      if (isFresh) {
        sendPushAlert(`🚨 Motion in ${spaceConfig.name}`, {
          body: `Movement detected by ${latest.cameraName} (${latest.motionScore}% index)`,
          icon: latest.snapshot,
          tag: `motion-${latest.id}`,
        });
      }
    }
  }, [motionEvents, pushEnabled, securityMode, sendPushAlert, spaceConfig.name]);

  // Motion Detection Sensitivity Threshold in Space Configuration
  const [motionSensitivity, setMotionSensitivity] = useState<number>(
    spaceConfig.motionSensitivity ?? 50
  );
  const [showSensitivityInfo, setShowSensitivityInfo] = useState(false);

  // Sync state if spaceConfig updates
  useEffect(() => {
    if (typeof spaceConfig.motionSensitivity === 'number') {
      setMotionSensitivity(spaceConfig.motionSensitivity);
    }
  }, [spaceConfig.motionSensitivity]);

  const handleSensitivityChange = (newVal: number) => {
    const clamped = Math.min(100, Math.max(1, newVal));
    setMotionSensitivity(clamped);
    if (onUpdateMotionSensitivity) {
      onUpdateMotionSensitivity(clamped);
    }
    cameras.forEach((cam) => {
      sendRemoteCommand(cam.deviceId, 'set_motion_sensitivity', clamped);
    });
  };

  const detectionThresholdScore = Math.max(
    3,
    Math.round(20 - (motionSensitivity / 100) * 16)
  );

  const getSensitivityLabel = (val: number) => {
    if (val <= 30) return 'Low (Strict)';
    if (val <= 60) return 'Balanced';
    if (val <= 80) return 'High';
    return 'Ultra';
  };

  const containerRef = useRef<HTMLDivElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordTimerRef = useRef<any>(null);
  const intercomRecorderRef = useRef<MediaRecorder | null>(null);
  const intercomStreamRef = useRef<MediaStream | null>(null);

  const cameras = devices.filter((d) => d.role === 'camera');
  const isViewOnly = !!spaceConfig.isViewOnly;

  // Filter styles for night vision modes
  const filterStyles: Record<DisplayFilterMode, string> = {
    normal: '',
    night_vision_ir: 'brightness(1.2) contrast(1.5) hue-rotate(90deg) saturate(1.8)',
    high_contrast_bw: 'grayscale(100%) contrast(1.8) brightness(1.1)',
    thermal_cam: 'contrast(1.6) invert(80%) hue-rotate(180deg) saturate(2)',
  };

  // Clock ticker
  useEffect(() => {
    const t = setInterval(() => {
      setOsdTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(t);
  }, []);

  // Poll for other active spaces
  useEffect(() => {
    const fetchSpaces = () => {
      fetch('/api/spaces')
        .then((r) => r.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setDiscoveredSpaces(data);
          }
        })
        .catch(() => {});
    };

    fetchSpaces();
    const interval = setInterval(fetchSpaces, 3000);
    return () => clearInterval(interval);
  }, []);

  // Auto-select first active camera
  useEffect(() => {
    if (cameras.length > 0) {
      if (!selectedCameraId || !cameras.some((c) => c.deviceId === selectedCameraId)) {
        setSelectedCameraId(cameras[0].deviceId);
      }
    } else {
      setSelectedCameraId(null);
    }
  }, [cameras, selectedCameraId]);

  // Fullscreen listener
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // Remote Siren trigger
  const handleToggleSiren = (targetDeviceId: string) => {
    if (isViewOnly) return;
    if (activeSirenDeviceId === targetDeviceId) {
      sendRemoteCommand(targetDeviceId, 'stop_siren');
      setActiveSirenDeviceId(null);
    } else {
      sendRemoteCommand(targetDeviceId, 'siren');
      setActiveSirenDeviceId(targetDeviceId);
      setTimeout(() => {
        setActiveSirenDeviceId((cur) => (cur === targetDeviceId ? null : cur));
      }, 5000);
    }
  };

  // Remote Torch toggle
  const handleToggleTorch = (targetDeviceId: string, currentTorchState?: boolean) => {
    if (isViewOnly) return;
    const newState = !currentTorchState;
    sendRemoteCommand(targetDeviceId, 'torch', newState);
  };

  // AI Frame Analyzer
  const handleAnalyzeSnapshot = async (event: MotionAlertEvent) => {
    if (!event.snapshot) return;
    setAnalyzingEventId(event.id);
    try {
      const res = await fetch('/api/ai/analyze-frame', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: event.snapshot,
          spaceName: spaceConfig.name,
          motionScore: event.motionScore,
        }),
      });
      const data = await res.json();
      if (data.analysis) {
        setAnalyzedEvents((prev) => ({
          ...prev,
          [event.id]: data.analysis,
        }));
        event.aiAnalysis = data.analysis;
      }
    } catch (err) {
      console.warn('AI analysis failed:', err);
    } finally {
      setAnalyzingEventId(null);
    }
  };

  // Two-way Push-to-Talk Intercom
  const startIntercom = async (targetDeviceId: string) => {
    if (isViewOnly) return;
    try {
      playIntercomBeep('start');
      setIsTalking(true);
      setTalkingToDeviceId(targetDeviceId);

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
      });
      intercomStreamRef.current = stream;

      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      intercomRecorderRef.current = recorder;

      recorder.ondataavailable = async (e) => {
        if (e.data && e.data.size > 0) {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64Data = reader.result as string;
            sendIntercomAudio(targetDeviceId, base64Data);
          };
          reader.readAsDataURL(e.data);
        }
      };

      recorder.start(400);
    } catch (err) {
      console.warn('Microphone permission required for Intercom:', err);
      setIsTalking(false);
      setTalkingToDeviceId(null);
    }
  };

  const stopIntercom = () => {
    playIntercomBeep('end');
    setIsTalking(false);
    setTalkingToDeviceId(null);

    if (intercomRecorderRef.current && intercomRecorderRef.current.state !== 'inactive') {
      try {
        intercomRecorderRef.current.stop();
      } catch (_) {}
    }
    if (intercomStreamRef.current) {
      intercomStreamRef.current.getTracks().forEach((t) => t.stop());
      intercomStreamRef.current = null;
    }
  };

  // Snapshot capture
  const captureSnapshot = (deviceId: string) => {
    const frameData = remoteFrames[deviceId]?.frame;
    const stream = remoteStreams[deviceId];
    let dataUrl = frameData;

    if (!dataUrl && stream) {
      const video = document.getElementById(`video-${deviceId}`) as HTMLVideoElement;
      if (video) {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || 1280;
        canvas.height = video.videoHeight || 720;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        }
      }
    }

    if (dataUrl) {
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `AYASEC_Snapshot_${new Date().toISOString().replace(/[:.]/g, '-')}.jpg`;
      a.click();
    }
  };

  // Video recording
  const startRecording = (deviceId: string) => {
    const stream = remoteStreams[deviceId];
    let recordStream: MediaStream | null = stream || null;

    if (!recordStream) {
      const canvas = document.getElementById(`canvas-${deviceId}`) as HTMLCanvasElement;
      if (canvas && (canvas as any).captureStream) {
        recordStream = (canvas as any).captureStream(15);
      }
    }

    if (!recordStream) {
      alert('Video feed must be active to record clips.');
      return;
    }

    recordedChunksRef.current = [];
    setRecordingDeviceId(deviceId);
    setRecordSeconds(0);

    recordTimerRef.current = setInterval(() => {
      setRecordSeconds((s) => s + 1);
    }, 1000);

    try {
      const recorder = new MediaRecorder(recordStream, {
        mimeType: MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
          ? 'video/webm;codecs=vp9'
          : 'video/webm',
      });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const cam = cameras.find((c) => c.deviceId === deviceId);

        if (onSaveRecordedClip) {
          onSaveRecordedClip({
            cameraDeviceId: deviceId,
            cameraName: cam?.name || 'Camera',
            durationSeconds: recordSeconds || 5,
            blobUrl: url,
            thumbnailUrl: remoteFrames[deviceId]?.frame,
          });
        }

        const a = document.createElement('a');
        a.href = url;
        a.download = `AYASEC_Clip_${new Date().toISOString().replace(/[:.]/g, '-')}.webm`;
        a.click();
      };

      recorder.start(1000);
    } catch (err) {
      console.error('Failed to start recording:', err);
      clearInterval(recordTimerRef.current);
      setRecordingDeviceId(null);
    }
  };

  const stopRecording = () => {
    if (recordTimerRef.current) {
      clearInterval(recordTimerRef.current);
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setRecordingDeviceId(null);
  };

  // Find other spaces with active cameras
  const otherSpacesWithCameras = discoveredSpaces.filter(
    (s) => s.spaceId !== spaceConfig.spaceId && s.devices.some((d) => d.role === 'camera')
  );

  return (
    <div
      ref={containerRef}
      className="flex-1 w-full min-h-[calc(100vh-62px)] bg-slate-100 text-slate-900 flex flex-col"
    >
      {/* Top Professional Toolbar */}
      <div className="w-full bg-white border-b border-slate-200 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs shadow-2xs">
        {/* Left: Security Mode Selector & Guest Badge */}
        <div className="flex items-center gap-2">
          {isViewOnly ? (
            <span className="px-2.5 py-1 rounded-lg bg-cyan-100 text-cyan-800 font-bold text-xs flex items-center gap-1.5 border border-cyan-200">
              <Eye className="w-3.5 h-3.5" /> Guest View-Only
            </span>
          ) : (
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => onChangeSecurityMode?.('disarmed')}
                className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition ${
                  securityMode === 'disarmed'
                    ? 'bg-white text-emerald-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="System Disarmed: Monitoring without siren alarms"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Disarmed</span>
              </button>

              <button
                onClick={() => onChangeSecurityMode?.('home')}
                className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition ${
                  securityMode === 'home'
                    ? 'bg-white text-amber-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Home Mode: Push notifications and event recording active"
              >
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>Home</span>
              </button>

              <button
                onClick={() => onChangeSecurityMode?.('away')}
                className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition ${
                  securityMode === 'away'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Away Mode: Maximum security with instant siren alarm on motion"
              >
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                <span>Away Armed</span>
              </button>
            </div>
          )}

          {/* View Mode Toggle: Focus vs Grid */}
          {cameras.length > 1 && (
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setViewMode('focus')}
                className={`px-2 py-1 rounded-lg font-medium transition ${
                  viewMode === 'focus' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
                title="Focus on single camera"
              >
                Focus
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-2 py-1 rounded-lg font-medium transition flex items-center gap-1 ${
                  viewMode === 'grid' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
                title="Multi-camera Security Wall"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Grid ({cameras.length})</span>
              </button>
            </div>
          )}
        </div>

        {/* Center: Camera selector (in Focus mode) */}
        {viewMode === 'focus' && cameras.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 max-w-full">
            {cameras.map((c) => (
              <button
                key={c.deviceId}
                onClick={() => setSelectedCameraId(c.deviceId)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold border transition ${
                  selectedCameraId === c.deviceId
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    selectedCameraId === c.deviceId ? 'bg-emerald-400' : 'bg-emerald-600'
                  }`}
                />
                <span>{c.name}</span>
                {c.batteryLevel !== undefined && (
                  <span className="text-[10px] opacity-80 font-mono">{c.batteryLevel}%</span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Right Tools: Night Vision, Push Notifications, DVR, Audit, Share */}
        <div className="flex items-center gap-2">
          {/* Display Mode (Night Vision IR Filter) */}
          <select
            value={displayFilter}
            onChange={(e) => setDisplayFilter(e.target.value as DisplayFilterMode)}
            className="px-2.5 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none"
            title="Switch display filter mode"
          >
            <option value="normal">Normal Color</option>
            <option value="night_vision_ir">🌙 Night Vision IR</option>
            <option value="high_contrast_bw">🌗 Contrast B&W</option>
            <option value="thermal_cam">🔥 False Thermal</option>
          </select>

          {/* Push Notification Toggle */}
          <button
            onClick={handleTogglePush}
            className={`p-2 rounded-xl border transition flex items-center gap-1.5 ${
              pushEnabled
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
            title={pushEnabled ? 'Push notifications active' : 'Enable Mobile Push Notifications'}
          >
            {pushEnabled ? <Bell className="w-3.5 h-3.5" /> : <BellOff className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{pushEnabled ? 'Alerts On' : 'Alerts'}</span>
          </button>

          {/* DVR Timeline Drawer Button */}
          <button
            onClick={() => setShowDVR(!showDVR)}
            className={`px-3 py-1.5 rounded-xl border font-semibold flex items-center gap-1.5 transition ${
              showDVR
                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
            title="Open DVR Event Timeline and Playback"
          >
            <Film className="w-3.5 h-3.5 text-indigo-500" />
            <span>DVR ({recordedClips.length})</span>
          </button>

          {/* Security Audit Log */}
          <button
            onClick={() => {
              onRefreshAuditLogs?.();
              setShowAuditModal(true);
            }}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition"
            title="System Security Audit Log"
          >
            <FileText className="w-3.5 h-3.5 text-slate-600" />
          </button>

          {/* Share Access Modal */}
          <button
            onClick={() => setShowShareModal(true)}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition"
            title="Share Space Access (Family / Guest Links & QR)"
          >
            <Share2 className="w-3.5 h-3.5 text-cyan-600" />
          </button>

          {/* Activity Drawer Toggle */}
          <button
            onClick={() => setShowAlertsDrawer(!showAlertsDrawer)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium transition"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            <span>Logs</span>
            {motionEvents.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center">
                {motionEvents.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Embedded DVR Timeline Section (when open) */}
      {showDVR && (
        <div className="p-4 border-b border-slate-200 bg-slate-900">
          <DVRTimeline
            motionEvents={motionEvents}
            recordedClips={recordedClips}
            onSelectEvent={(evt) => setSelectedSnapshot(evt)}
            onClose={() => setShowDVR(false)}
          />
        </div>
      )}

      {/* Main Video Viewport */}
      <div className="flex-1 flex flex-col p-3 sm:p-6 overflow-y-auto">
        {cameras.length === 0 ? (
          /* Waiting Screen */
          <div className="max-w-lg w-full m-auto rounded-2xl bg-white border border-slate-200 p-6 sm:p-8 text-center shadow-sm space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto text-slate-700">
              <Video className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900">
                Awaiting Camera in &quot;{spaceConfig.name}&quot;
              </h3>
              <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
                Both your Camera and Viewer must join the <strong>same Space Name</strong> and <strong>Passcode</strong>.
              </p>
              <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 font-mono text-xs font-semibold">
                <span>Space: {spaceConfig.name}</span>
                <span className="text-slate-300">•</span>
                <span>Passcode: {spaceConfig.accessCode}</span>
              </div>
            </div>

            {otherSpacesWithCameras.length > 0 && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-left space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-900">
                  <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                  <span>Active Camera Found in Another Space!</span>
                </div>
                <div className="space-y-1.5">
                  {otherSpacesWithCameras.map((s) => (
                    <div
                      key={s.spaceId}
                      className="flex items-center justify-between p-2 rounded-lg bg-white border border-emerald-200 text-xs"
                    >
                      <span className="font-bold text-slate-900">{s.name}</span>
                      {onSwitchSpace && (
                        <button
                          onClick={() => onSwitchSpace(s.spaceId, s.name, s.accessCode)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-medium transition"
                        >
                          <span>Switch</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2 pt-1">
              <button
                onClick={onOpenPairQR}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs transition"
              >
                <QrCode className="w-4 h-4" />
                <span>Pair Camera (Direct Link / QR Code)</span>
              </button>

              <button
                onClick={onSwitchToCamera}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs transition border border-slate-200"
              >
                <Camera className="w-4 h-4" />
                <span>Use This Device as Camera</span>
              </button>
            </div>
          </div>
        ) : viewMode === 'grid' ? (
          /* Multi-Camera Security Wall Grid */
          <div className="w-full max-w-7xl mx-auto">
            <MultiCameraGrid
              cameras={cameras}
              remoteStreams={remoteStreams}
              remoteFrames={remoteFrames}
              displayFilter={displayFilter}
              onSelectCamera={(id) => {
                setSelectedCameraId(id);
                setViewMode('focus');
              }}
              onToggleTorch={handleToggleTorch}
              onToggleSiren={handleToggleSiren}
              onSnapshot={captureSnapshot}
            />
          </div>
        ) : (
          /* Single Camera Focus Monitor */
          <div className="w-full max-w-5xl mx-auto flex-1 flex flex-col justify-center">
            {cameras
              .filter((c) => (selectedCameraId ? c.deviceId === selectedCameraId : true))
              .map((cam) => {
                const stream = remoteStreams[cam.deviceId];
                const frameInfo = remoteFrames[cam.deviceId];
                const isRecording = recordingDeviceId === cam.deviceId;
                const isSirenOn = activeSirenDeviceId === cam.deviceId;
                const isShutterActive = !!cam.privacyShutter;

                return (
                  <div
                    key={cam.deviceId}
                    className="w-full rounded-2xl overflow-hidden bg-white border border-slate-300 shadow-sm flex flex-col"
                  >
                    {/* Viewport Screen */}
                    <div className="relative w-full aspect-video bg-slate-950 flex items-center justify-center overflow-hidden">
                      {isShutterActive ? (
                        <div className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center p-6 text-center text-slate-100 z-10">
                          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 mb-3 animate-pulse">
                            <Lock className="w-7 h-7" />
                          </div>
                          <p className="text-sm font-bold text-white uppercase tracking-wider mb-1">
                            Privacy Shutter Engaged
                          </p>
                          <p className="text-xs text-slate-400 max-w-sm mb-4">
                            Camera optical sensor and microphone are currently masked by the camera device for privacy.
                          </p>
                          {!isViewOnly && (
                            <button
                              onClick={() => {
                                sendRemoteCommand(cam.deviceId, 'toggle_privacy_shutter', false);
                                if (onTogglePrivacyShutter) onTogglePrivacyShutter(false);
                              }}
                              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded-xl transition flex items-center gap-2"
                            >
                              <Unlock className="w-4 h-4" /> Request Shutter Open
                            </button>
                          )}
                        </div>
                      ) : stream ? (
                        <video
                          id={`video-${cam.deviceId}`}
                          autoPlay
                          playsInline
                          muted={isAudioMuted}
                          style={{ filter: filterStyles[displayFilter] }}
                          ref={(el) => {
                            if (el && el.srcObject !== stream) {
                              el.srcObject = stream;
                            }
                          }}
                          className="w-full h-full object-contain"
                        />
                      ) : frameInfo ? (
                        <img
                          id={`image-${cam.deviceId}`}
                          src={frameInfo.frame}
                          alt={cam.name}
                          style={{ filter: filterStyles[displayFilter] }}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-slate-500 text-xs">
                          <Radio className="w-6 h-6 text-slate-400 animate-spin mb-2" />
                          <span>Establishing camera stream...</span>
                        </div>
                      )}

                      {/* Technical OSD Overlays */}
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none text-white font-mono text-[11px] z-20">
                        {/* Channel / Status & Transport */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-black/60 backdrop-blur-xs border border-white/10">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            <span className="font-semibold">{cam.name}</span>
                            <span className="text-white/60">LIVE</span>
                          </div>

                          <div className="flex items-center gap-1 px-2 py-1 rounded bg-black/60 backdrop-blur-xs border border-white/10 text-[10px]">
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                transportMode === 'webrtc' ? 'bg-cyan-400' : 'bg-amber-400'
                              }`}
                            />
                            <span className="text-white/90">
                              {transportMode === 'webrtc' ? 'WebRTC P2P' : 'Relay'}
                            </span>
                            {latencyMs !== null && latencyMs !== undefined && (
                              <span className="text-white/60">• {latencyMs}ms</span>
                            )}
                          </div>

                          {isRecording && (
                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-rose-600 text-white font-bold animate-pulse">
                              <span className="w-1.5 h-1.5 rounded-full bg-white" />
                              <span>
                                REC {String(Math.floor(recordSeconds / 60)).padStart(2, '0')}:
                                {String(recordSeconds % 60).padStart(2, '0')}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Timestamp & Telemetry */}
                        <div className="flex items-center gap-2">
                          {frameInfo && frameInfo.motionScore > 10 && (
                            <div
                              className={`px-2 py-1 rounded font-semibold text-[10px] flex items-center gap-1 ${
                                frameInfo.motionScore > detectionThresholdScore
                                  ? 'bg-rose-500 text-white animate-pulse'
                                  : 'bg-amber-500/80 text-black'
                              }`}
                            >
                              <span>MOTION {frameInfo.motionScore}%</span>
                            </div>
                          )}

                          <div className="px-2.5 py-1 rounded bg-black/60 backdrop-blur-xs border border-white/10 text-white/80">
                            {osdTime}
                          </div>

                          {cam.batteryLevel !== undefined && (
                            <div className="flex items-center gap-1 px-2.5 py-1 rounded bg-black/60 backdrop-blur-xs border border-white/10 text-white/80 text-[10px]">
                              {cam.isCharging ? (
                                <BatteryCharging className="w-3 h-3 text-emerald-400" />
                              ) : (
                                <Battery className="w-3 h-3 text-white/60" />
                              )}
                              <span>{cam.batteryLevel}%</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Display Mode Indicator Badge */}
                      {displayFilter !== 'normal' && (
                        <div className="absolute bottom-3 left-3 z-20 px-2 py-1 bg-black/70 backdrop-blur rounded-lg text-[10px] font-mono uppercase tracking-wider text-emerald-400 border border-emerald-500/30">
                          {displayFilter.replace(/_/g, ' ')}
                        </div>
                      )}

                      {/* Siren active banner */}
                      {isSirenOn && (
                        <div className="absolute inset-x-4 top-14 p-2.5 rounded-lg bg-rose-600 text-white flex items-center justify-between font-mono text-xs z-30">
                          <div className="flex items-center gap-2">
                            <ShieldAlert className="w-4 h-4" />
                            <span className="font-bold uppercase tracking-wider">
                              REMOTE SIREN TRIGGERED ON CAMERA
                            </span>
                          </div>
                          <button
                            onClick={() => handleToggleSiren(cam.deviceId)}
                            className="px-2.5 py-1 rounded bg-white text-rose-700 font-bold text-xs"
                          >
                            Halt Siren
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Bottom Control Deck */}
                    <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                      {/* Left: Intercom Push-to-Talk */}
                      <div className="flex items-center gap-2">
                        {!isViewOnly && (
                          <button
                            onMouseDown={() => startIntercom(cam.deviceId)}
                            onMouseUp={stopIntercom}
                            onTouchStart={() => startIntercom(cam.deviceId)}
                            onTouchEnd={stopIntercom}
                            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition select-none ${
                              isTalking
                                ? 'bg-rose-600 text-white shadow-md animate-pulse'
                                : 'bg-slate-900 hover:bg-slate-800 text-white'
                            }`}
                            title="Hold to talk through bedroom camera speaker"
                          >
                            <Mic className="w-3.5 h-3.5" />
                            <span>{isTalking ? 'TALKING (LIVE)...' : 'Hold to Talk'}</span>
                          </button>
                        )}

                        {/* Snapshot */}
                        <button
                          onClick={() => captureSnapshot(cam.deviceId)}
                          className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold flex items-center gap-1.5 transition"
                          title="Capture full-resolution photo"
                        >
                          <Camera className="w-3.5 h-3.5" />
                          <span>Snapshot</span>
                        </button>

                        {/* Manual DVR Recording */}
                        {!isViewOnly && (
                          <button
                            onClick={() => {
                              if (isRecording) stopRecording();
                              else startRecording(cam.deviceId);
                            }}
                            className={`px-3 py-2 rounded-xl font-semibold flex items-center gap-1.5 transition ${
                              isRecording
                                ? 'bg-rose-600 text-white shadow-xs'
                                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                            }`}
                            title="Record video clip"
                          >
                            {isRecording ? (
                              <Square className="w-3.5 h-3.5 fill-current" />
                            ) : (
                              <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
                            )}
                            <span>{isRecording ? 'Stop Recording' : 'Record Clip'}</span>
                          </button>
                        )}
                      </div>

                      {/* Right: Remote controls */}
                      <div className="flex items-center gap-1.5">
                        {!isViewOnly && (
                          <>
                            {/* Flashlight/Torch */}
                            <button
                              onClick={() => handleToggleTorch(cam.deviceId, cam.torchOn)}
                              className={`p-2 rounded-xl border transition ${
                                cam.torchOn
                                  ? 'bg-amber-400 border-amber-500 text-slate-900 shadow-xs'
                                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                              }`}
                              title={cam.torchOn ? 'Turn Flashlight Off' : 'Turn Flashlight On'}
                            >
                              <Flashlight className="w-3.5 h-3.5" />
                            </button>

                            {/* Remote Siren */}
                            <button
                              onClick={() => handleToggleSiren(cam.deviceId)}
                              className={`p-2 rounded-xl border transition ${
                                isSirenOn
                                  ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                                  : 'bg-white border-slate-200 text-rose-600 hover:bg-rose-50'
                              }`}
                              title="Sound Remote Siren on Camera"
                            >
                              <ShieldAlert className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}

                        {/* Audio Mute */}
                        <button
                          onClick={() => setIsAudioMuted(!isAudioMuted)}
                          className={`p-2 rounded-xl border transition ${
                            isAudioMuted
                              ? 'bg-slate-200 border-slate-300 text-slate-600'
                              : 'bg-white border-slate-200 text-emerald-700 hover:bg-emerald-50'
                          }`}
                          title={isAudioMuted ? 'Unmute audio' : 'Mute audio'}
                        >
                          {isAudioMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                        </button>

                        {/* Fullscreen */}
                        <button
                          onClick={toggleFullscreen}
                          className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition"
                          title="Fullscreen view"
                        >
                          {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                        </button>

                        {/* Refresh Stream */}
                        {onRefreshStream && (
                          <button
                            onClick={() => {
                              setIsRefreshing(true);
                              onRefreshStream(cam.deviceId);
                              setTimeout(() => setIsRefreshing(false), 1000);
                            }}
                            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 transition"
                            title="Re-synchronize stream"
                          >
                            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-slate-900' : ''}`} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {/* Motion Activity Log Drawer */}
      {showAlertsDrawer && (
        <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-white border-l border-slate-200 shadow-2xl p-5 flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <h3 className="font-semibold text-slate-900 text-sm">Activity Alerts</h3>
              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-[10px] font-mono text-slate-600">
                {motionEvents.length}
              </span>
            </div>
            <button
              onClick={() => setShowAlertsDrawer(false)}
              className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-4 space-y-3 custom-scrollbar">
            {motionEvents.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                No motion activity recorded.
              </div>
            ) : (
              motionEvents.map((evt) => (
                <div
                  key={evt.id}
                  onClick={() => setSelectedSnapshot(evt)}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition space-y-2 cursor-pointer"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800">{evt.cameraName}</span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(evt.timestamp).toLocaleTimeString()}
                    </span>
                  </div>

                  {evt.snapshot && (
                    <div className="relative rounded-lg overflow-hidden aspect-video bg-black">
                      <img
                        src={evt.snapshot}
                        alt="Motion snapshot"
                        className="w-full h-full object-cover"
                      />
                      {evt.aiAnalysis && (
                        <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur text-[10px] font-bold text-white uppercase border border-white/20">
                          {evt.aiAnalysis.category}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                    <span>Motion: {evt.motionScore}%</span>
                    <span className="text-indigo-600 font-medium hover:underline">Inspect & AI Scan</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Snapshot Enlarge & AI Analysis Modal */}
      {selectedSnapshot && (
        <div
          onClick={() => setSelectedSnapshot(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-2xl w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 p-5 shadow-2xl text-slate-100 flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 text-xs border-b border-slate-800">
              <span className="font-bold text-white">
                {selectedSnapshot.cameraName} &bull; {new Date(selectedSnapshot.timestamp).toLocaleString()}
              </span>
              <button
                onClick={() => setSelectedSnapshot(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Image Preview */}
            <div className="relative rounded-xl overflow-hidden bg-black mt-3 flex-1 flex items-center justify-center border border-slate-800">
              <img
                src={selectedSnapshot.snapshot}
                alt="Alert snapshot"
                className="w-full max-h-[50vh] object-contain"
              />
            </div>

            {/* Smart AI Vision Analysis Section */}
            <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Smart AI Vision Analysis
                  </span>
                </div>

                <button
                  disabled={analyzingEventId === selectedSnapshot.id}
                  onClick={() => handleAnalyzeSnapshot(selectedSnapshot)}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${analyzingEventId === selectedSnapshot.id ? 'animate-spin' : ''}`} />
                  <span>
                    {analyzingEventId === selectedSnapshot.id
                      ? 'Analyzing with Gemini...'
                      : selectedSnapshot.aiAnalysis || analyzedEvents[selectedSnapshot.id]
                      ? 'Re-Analyze'
                      : 'Scan Frame with AI'}
                  </span>
                </button>
              </div>

              {/* Analysis Result */}
              {(selectedSnapshot.aiAnalysis || analyzedEvents[selectedSnapshot.id]) && (
                <div className="space-y-2 pt-2 border-t border-slate-800 text-xs">
                  {(() => {
                    const res = selectedSnapshot.aiAnalysis || analyzedEvents[selectedSnapshot.id];
                    let badge = 'bg-slate-800 text-slate-300';
                    let Icon = User;
                    if (res.category === 'person') {
                      badge = 'bg-rose-500/20 text-rose-300 border-rose-500/30';
                      Icon = User;
                    } else if (res.category === 'pet') {
                      badge = 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
                      Icon = Dog;
                    } else if (res.category === 'vehicle') {
                      badge = 'bg-amber-500/20 text-amber-300 border-amber-500/30';
                      Icon = Car;
                    } else if (res.category === 'package') {
                      badge = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
                      Icon = Package;
                    }

                    return (
                      <>
                        <div className="flex items-center justify-between">
                          <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold border flex items-center gap-1.5 ${badge}`}>
                            <Icon className="w-3.5 h-3.5" />
                            <span className="uppercase">{res.category}</span>
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono">
                            {res.confidence}% confidence &bull; Urgency: <strong className="text-white capitalize">{res.urgency}</strong>
                          </span>
                        </div>
                        <p className="text-slate-200 text-xs font-medium leading-relaxed">
                          &quot;{res.summary}&quot;
                        </p>
                        {res.objects && res.objects.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {res.objects.map((obj, i) => (
                              <span key={i} className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded text-[10px] font-mono">
                                #{obj}
                              </span>
                            ))}
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="mt-4 flex items-center justify-between pt-2 border-t border-slate-800">
              <span className="text-xs text-slate-400 font-mono">
                Motion index: {selectedSnapshot.motionScore}%
              </span>
              <a
                href={selectedSnapshot.snapshot}
                download={`AYASEC_Alert_${selectedSnapshot.id}.jpg`}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save High-Res Image</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Share Space Access Modal */}
      <ShareAccessModal
        spaceConfig={spaceConfig}
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
      />

      {/* Security Audit Log Modal */}
      <AuditLogModal
        logs={auditLogs}
        isOpen={showAuditModal}
        onClose={() => setShowAuditModal(false)}
        spaceName={spaceConfig.name}
      />
    </div>
  );
};

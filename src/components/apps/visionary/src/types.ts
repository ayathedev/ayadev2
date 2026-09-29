export type DeviceRole = 'camera' | 'viewer';

export interface DeviceInfo {
  deviceId: string;
  name: string;
  role: DeviceRole;
  joinedAt: number;
  batteryLevel?: number;
  isCharging?: boolean;
  status: 'online' | 'streaming' | 'idle';
  facingMode?: 'user' | 'environment';
  torchOn?: boolean;
  resolution?: string;
  fps?: number;
  privacyShutter?: boolean;
}

export interface AIEventAnalysis {
  category: 'person' | 'pet' | 'vehicle' | 'package' | 'unknown' | 'false_alarm';
  summary: string;
  urgency: 'low' | 'medium' | 'high';
  confidence: number;
  objects: string[];
  analyzedAt: number;
}

export interface MotionAlertEvent {
  id: string;
  cameraDeviceId: string;
  cameraName: string;
  timestamp: number;
  motionScore: number;
  snapshot?: string; // base64 JPEG thumbnail
  aiAnalysis?: AIEventAnalysis;
  clipUrl?: string; // Recorded video clip URL
}

export interface RecordedClip {
  id: string;
  cameraDeviceId: string;
  cameraName: string;
  timestamp: number;
  durationSeconds: number;
  blobUrl: string;
  thumbnailUrl?: string;
  motionScore?: number;
  aiCategory?: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: number;
  level: 'info' | 'warn' | 'alert';
  action: string;
  details: string;
  deviceId?: string;
  deviceName?: string;
}

export type SystemSecurityMode = 'disarmed' | 'home' | 'away';
export type DisplayFilterMode = 'normal' | 'night_vision_ir' | 'high_contrast_bw' | 'thermal_cam';

export interface SpaceConfig {
  spaceId: string;
  name: string;
  accessCode: string;
  role: DeviceRole;
  deviceName: string;
  motionSensitivity?: number; // Motion detection sensitivity threshold (1 - 100)
  securityMode?: SystemSecurityMode;
  isViewOnly?: boolean;
}

export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'auth_error';

export type ConnectionQuality = 'excellent' | 'good' | 'fair' | 'poor' | 'reconnecting';
export type TransportMode = 'webrtc' | 'relay' | 'connecting';

export interface CameraSettings {
  motionDetection: boolean;
  motionSensitivity: number; // 1 - 100
  localAlarmOnMotion: boolean;
  stealthMode: boolean;
  facingMode: 'user' | 'environment';
  torchEnabled: boolean;
  audioMuted: boolean;
  streamFps: number; // 5 - 30
  streamQuality: number; // 0.1 - 0.9
  privacyShutter: boolean;
  displayFilter: DisplayFilterMode;
  autoRecordClips: boolean;
}

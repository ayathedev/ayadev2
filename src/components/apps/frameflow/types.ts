export interface WatermarkConfig {
  enabled: boolean;
  text: string;
  logoUrl?: string;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  opacity: number; // 0.1 to 1.0
  fontSize: number; // 12 to 48
  color: string;
  removeDefaultWatermark: boolean;
}

export interface CapturedFrame {
  id: string;
  dataUrl: string;
  timestamp: number;
  fileName: string;
  captureTime: number;
  sourceFile: string;
  frameNumber: number;
  tags?: string[];
  width?: number;
  height?: number;
  qualityScore?: number;
  isAiEnhanced?: boolean;
}

export interface VideoMetadata {
  name: string;
  duration: number;
  width: number;
  height: number;
  type: string;
}

export interface BatchExportSettings {
  enabled: boolean;
  frameRate: number; // Frames per second to capture
  isProcessing: boolean;
  progress: number;
}

export interface ExportSettings {
  format: 'image/png' | 'image/jpeg' | 'image/webp';
  quality: number;
  prefix: string;
  includeTimestamp: boolean;
  autoCaptureEnabled: boolean;
  autoCaptureInterval: number;
  scale: number;
  watermarkText?: string;
  watermarkConfig?: WatermarkConfig;
  superResolution?: boolean;
}

export interface GifStudioSettings {
  fps: number;
  speed: number;
  pingPong: boolean;
  quality: number;
  maxWidth: number;
  watermark: boolean;
  caption?: string;
}


export type ClipType = 'video' | 'image' | 'audio' | 'text';
export type TransitionType = 'none' | 'fade' | 'dissolve' | 'wipe-right' | 'wipe-left' | 'wipe-up' | 'wipe-down';

export interface TransitionConfig {
  type: TransitionType;
  duration: number; // in seconds
}

export interface VisualFilters {
  brightness: number;
  contrast: number;
  saturation: number;
  hue: number;
  vibrancy: number;
  sepia: number;
  grayscale: number;
  blur: number;
  invert: number;
  opacity: number;
  blackpoint: number;
  whitepoint: number;
  gain: number;
  gamma: number;
}

export interface TrackingKeyframe {
  time: number;
  x: number; // 0-100 percentage
  y: number; // 0-100 percentage
}

export interface AIAnalysis {
  mood: string;
  lookName: string;
  colorAdvice: string;
  suggestedFilters?: Partial<VisualFilters>;
  bgRemovalConfidence?: number;
  suggestedMusic?: string;
  suggestedSFX?: string[];
  subjectDescription?: string;
}

export interface Clip {
  id: string;
  type: ClipType;
  name: string;
  source: string; // URL or DataURL
  startTime: number; // Seconds from project start
  duration: number; // In seconds
  offset: number; // Offset into the media source
  layerIndex: number;
  filters: VisualFilters;
  volume: number; // 0 to 200 (100 is unity)
  pan: number; // -100 (Full Left) to 100 (Full Right)
  backgroundRemoved?: boolean;
  subjectRect?: { x: number; y: number; w: number; h: number }; // Relative percentage 0-100
  trackingKeyframes?: TrackingKeyframe[];
  linkedTrackerId?: string; // ID of the clip whose motion this clip follows
  transitionIn?: TransitionConfig;
  aiAnalysis?: AIAnalysis;
  textConfig?: {
    content: string;
    fontSize: number;
    color: string;
    fontFamily: string;
    x: number;
    y: number;
  };
}

export interface ProjectState {
  id: string;
  name: string;
  clips: Clip[];
  currentTime: number;
  duration: number;
  playing: boolean;
  selectedClipId: string | null;
  zoom: number; // Pixels per second
  masterVolume: number; // 0 to 150
}

export const INITIAL_FILTERS: VisualFilters = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  hue: 0,
  vibrancy: 100,
  sepia: 0,
  grayscale: 0,
  blur: 0,
  invert: 0,
  opacity: 100,
  blackpoint: 0,
  whitepoint: 100,
  gain: 100,
  gamma: 100
};

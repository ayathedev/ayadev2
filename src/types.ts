export type AppId = 
  | 'browser'
  | 'canvas'
  | 'synth'
  | 'files'
  | 'terminal'
  | 'assistant'
  | 'arcade'
  | 'notes'
  | 'settings'
  | 'about'
  | 'portfolio-browser'
  | 'canvas-studio'
  | 'synth-lab'
  | 'arcade-game'
  | 'ai-assistant'
  | 'studio-app'
  | 'busker-pad'
  | 'frame-flow'
  | 'haven-care'
  | 'ol-ave'
  | 'pantry-pal'
  | 'aya-music'
  | 'ollama-studio'
  | 'aidefend'
  | 'novel-writer'
  | 'ayasec-visionary'
  | 'aya-journalism'
  | 'admin-os'
  | 'ai-podcast';

export interface AppMetadata {
  id: AppId;
  name: string;
  category: 'portfolio' | 'creative' | 'utilities' | 'utility' | 'system' | 'game';
  iconName: string;
  description: string;
  pinnedToShelf: boolean;
  defaultWidth: number;
  defaultHeight: number;
  isSystem?: boolean;
}

export interface WindowState {
  id: string;
  appId: AppId;
  title: string;
  iconName: string;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  isMinimized: boolean;
  isMaximized: boolean;
  isFullScreen?: boolean;
  snapState?: 'left' | 'right' | null;
  customData?: any;
}

export interface UserProfile {
  name: string;
  handle: string;
  role: string;
  bio: string;
  location: string;
  avatarUrl: string;
  bannerUrl: string;
  socials: Record<string, string>;
  stats: {
    projectsCount: number;
    commitStreak: number;
    techStackCount: number;
  };
}

export interface ProjectItem {
  id: string;
  appId?: AppId;
  title: string;
  subtitle?: string;
  category: string;
  tags?: string[];
  description: string;
  longDescription: string;
  thumbnailUrl?: string;
  links?: {
    github?: string;
    demo?: string;
  };
  metrics: { label: string; value: string }[];
  features: string[];
}

export interface FileItem {
  id: string;
  name: string;
  type: 'folder' | 'document' | 'image' | 'audio' | 'code' | 'pdf' | 'doc';
  path?: string;
  size?: string;
  updatedAt: string;
  content?: string;
  appTarget?: AppId;
}

export interface Wallpaper {
  id: string;
  name: string;
  url: string;
  thumbnail?: string;
  category: string;
}

export interface SoundEffectOptions {
  enabled: boolean;
  volume: number;
}

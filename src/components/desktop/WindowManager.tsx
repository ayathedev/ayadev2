import React from 'react';
import { Window } from './Window';
import { WindowState, AppId } from '../../types';
import { AyaBrowserApp } from '../apps/AyaBrowserApp';
import { CanvasStudioApp } from '../apps/CanvasStudioApp';
import { SynthLabApp } from '../apps/SynthLabApp';
import { FileManagerApp } from '../apps/FileManagerApp';
import { TerminalApp } from '../apps/TerminalApp';
import { AiAssistantApp } from '../apps/AiAssistantApp';
import { NotesApp } from '../apps/NotesApp';
import { SettingsApp } from '../apps/SettingsApp';
import { StudioApp } from '../apps/StudioApp';
import { BuskerPadApp } from '../apps/BuskerPadApp';
import { FrameFlowApp } from '../apps/frameflow/FrameFlowApp';
import { HavenCareApp } from '../apps/havencare/HavenCareApp';
import { JournalismApp } from '../apps/journalism/JournalismApp';
import { OlaveApp } from '../apps/olave/OlaveApp';
import { PantryPalApp } from '../apps/pantrypal/PantryPalApp';
import { MusicVideoApp } from '../apps/music/MusicVideoApp';
import { OllamaStudioApp } from '../apps/ollama/OllamaStudioApp';
import { AiDefendApp } from '../apps/aidefend/AiDefendApp';
import { NovelWriterApp } from '../apps/novelwriter/NovelWriterApp';
import { VisionaryApp } from '../apps/visionary/VisionaryApp';
import { AdminOSApp } from '../apps/adminos/AdminOSApp';
import { AipodcastApp } from '../apps/aipodcast/AipodcastApp';

export interface WindowManagerProps {
  windows: WindowState[];
  activeWindowId: string | null;
  closeWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  maximizeWindow: (id: string) => void;
  onFullScreen: (id: string) => void;
  focusWindow: (id: string) => void;
  updateWindowPos: (id: string, x: number, y: number, w: number, h: number) => void;
  openApp: (appId: AppId, params?: Record<string, any>) => void;
  soundEnabled: boolean;
  activeWallpaperId: string;
  setWallpaper: (id: string) => void;
  setSoundEnabled: (enabled: boolean) => void;
  rerunSetupWizard?: () => void;
}

export const WindowManager: React.FC<WindowManagerProps> = ({
  windows,
  activeWindowId,
  closeWindow,
  minimizeWindow,
  maximizeWindow,
  onFullScreen,
  focusWindow,
  updateWindowPos,
  openApp,
  soundEnabled,
  activeWallpaperId,
  setWallpaper,
  setSoundEnabled,
  rerunSetupWizard,
}) => {
  const renderAppContent = (window: WindowState) => {
    switch (window.appId) {
      case 'portfolio-browser':
      case 'browser':
        return <AyaBrowserApp openApp={openApp} />;
      case 'canvas-studio':
      case 'canvas':
        return <CanvasStudioApp />;
      case 'synth-lab':
      case 'synth':
        return <SynthLabApp />;
      case 'files':
        return <FileManagerApp />;
      case 'terminal':
        return <TerminalApp />;
      case 'ai-assistant':
      case 'assistant':
        return <AiAssistantApp />;
      case 'arcade':
        return null;
      case 'notes':
        return <NotesApp />;
      case 'studio-app':
        return <StudioApp />;
      case 'busker-pad':
        return <BuskerPadApp />;
      case 'frame-flow':
        return <FrameFlowApp />;
      case 'haven-care':
        return <HavenCareApp />;
      case 'aya-journalism':
        return <JournalismApp openApp={openApp} />;
      case 'ol-ave':
        return <OlaveApp />;
      case 'pantry-pal':
        return <PantryPalApp />;
      case 'aya-music':
        return <MusicVideoApp />;
      case 'ollama-studio':
        return <OllamaStudioApp />;
      case 'aidefend':
        return <AiDefendApp />;
      case 'novel-writer':
        return <NovelWriterApp />;
      case 'ayasec-visionary':
        return <VisionaryApp />;
      case 'admin-os':
        return <AdminOSApp />;
      case 'ai-podcast':
        return <AipodcastApp />;
      case 'settings':
        return (
          <SettingsApp
            soundEnabled={soundEnabled}
            setSoundEnabled={setSoundEnabled}
            activeWallpaperId={activeWallpaperId}
            setWallpaper={setWallpaper}
            rerunSetupWizard={rerunSetupWizard}
          />
        );
      default:
        return <AyaBrowserApp openApp={openApp} />;
    }
  };

  return (
    <>
      {windows.map((win) => {
        const isActive = win.id === activeWindowId;
        return (
          <Window
            key={win.id}
            window={win}
            isActive={isActive}
            onFocus={() => focusWindow(win.id)}
            onClose={() => closeWindow(win.id)}
            onMinimize={() => minimizeWindow(win.id)}
            onMaximize={() => maximizeWindow(win.id)}
            onFullScreen={() => onFullScreen(win.id)}
            onUpdatePosition={(x, y) => updateWindowPos(win.id, x, y, win.width, win.height)}
            onUpdateSize={(w, h) => updateWindowPos(win.id, win.x, win.y, w, h)}
            onSnap={() => {}}
          >
            {renderAppContent(win)}
          </Window>
        );
      })}
    </>
  );
};

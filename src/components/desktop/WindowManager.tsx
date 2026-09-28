import React from 'react';
import { Window } from './Window';
import { WindowState, AppId } from '../../types';
import { ChromeBrowserApp } from '../apps/ChromeBrowserApp';
import { CanvasStudioApp } from '../apps/CanvasStudioApp';
import { SynthLabApp } from '../apps/SynthLabApp';
import { FileManagerApp } from '../apps/FileManagerApp';
import { TerminalApp } from '../apps/TerminalApp';
import { AiAssistantApp } from '../apps/AiAssistantApp';
import { ArcadeGameApp } from '../apps/ArcadeGameApp';
import { NotesApp } from '../apps/NotesApp';
import { SettingsApp } from '../apps/SettingsApp';
import { StudioApp } from '../apps/StudioApp';
import { BuskerPadApp } from '../apps/BuskerPadApp';
import { PodcastStudioApp } from '../apps/PodcastStudioApp';
import { HermesEbikeApp } from '../apps/HermesEbikeApp';

export interface WindowManagerProps {
  windows: WindowState[];
  activeWindowId: string | null;
  closeWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  maximizeWindow: (id: string) => void;
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
        return <ChromeBrowserApp />;
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
      case 'arcade-game':
      case 'arcade':
        return <ArcadeGameApp />;
      case 'notes':
        return <NotesApp />;
      case 'studio-app':
        return <StudioApp />;
      case 'busker-pad':
        return <BuskerPadApp />;
      case 'podcast-studio':
        return <PodcastStudioApp />;
      case 'hermes-ebike':
        return <HermesEbikeApp />;
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
        return <ChromeBrowserApp />;
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

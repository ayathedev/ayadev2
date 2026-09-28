import React, { useState, useEffect } from 'react';
import { AppId, WindowState } from '../../types';
import { APPS_METADATA } from '../../data/portfolioData';
import { WALLPAPERS } from '../../data/wallpapers';
import { Shelf } from './Shelf';
import { Launcher } from './Launcher';
import { QuickSettings } from './QuickSettings';
import { WindowManager } from './WindowManager';
import { SetupWizard } from './SetupWizard';
import { playUiSound } from '../../utils/soundEffects';
import { Wifi, Sparkles, HelpCircle } from 'lucide-react';

export const Desktop: React.FC = () => {
  // Sound effects preference
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    return localStorage.getItem('aya_os_sound') !== 'false';
  });

  // Setup Wizard State
  const [showSetupWizard, setShowSetupWizard] = useState<boolean>(() => {
    return localStorage.getItem('aya_os_setup_completed') !== 'true';
  });

  // Wallpaper selection state
  const [wallpaperId, setWallpaperId] = useState<string>(() => {
    const saved = localStorage.getItem('aya_os_wallpaper');
    if (saved === 'chromeos-official') return 'chromeos-abstract';
    if (saved === 'architectural') return 'architecture-minimal';
    return saved || 'chromeos-abstract';
  });

  // Launcher state
  const [isLauncherOpen, setIsLauncherOpen] = useState(false);

  // Quick Settings state
  const [isQuickSettingsOpen, setIsQuickSettingsOpen] = useState(false);

  // Managed Windows state
  const [windows, setWindows] = useState<WindowState[]>([]);
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null);

  // Save settings updates
  const handleToggleSound = (enabled: boolean) => {
    setSoundEnabled(enabled);
    localStorage.setItem('aya_os_sound', enabled ? 'true' : 'false');
  };

  const handleSetWallpaper = (id: string) => {
    setWallpaperId(id);
    localStorage.setItem('aya_os_wallpaper', id);
  };

  const currentWallpaper = WALLPAPERS.find(w => w.id === wallpaperId) || WALLPAPERS[0];

  // Window Management Actions
  const openApp = (appId: AppId, params?: Record<string, any>) => {
    playUiSound('openApp', soundEnabled);

    // Check if app window is already open
    const existing = windows.find(w => w.appId === appId);
    if (existing) {
      if (existing.isMinimized) {
        setWindows(prev => prev.map(w => w.id === existing.id ? { ...w, isMinimized: false } : w));
      }
      setActiveWindowId(existing.id);
      setIsLauncherOpen(false);
      return;
    }

    // Find app metadata
    const meta = APPS_METADATA.find(a => a.id === appId);
    if (!meta) return;

    // Calculate initial centered window positioning
    const offset = (windows.length % 6) * 24;
    const initialX = Math.max(20, Math.floor((window.innerWidth - meta.defaultWidth) / 2) + offset);
    const initialY = Math.max(30, Math.floor((window.innerHeight - meta.defaultHeight - 48) / 2) + offset);

    const newWindow: WindowState = {
      id: `${appId}-${Date.now()}`,
      appId,
      title: meta.name,
      iconName: meta.iconName,
      isMinimized: false,
      isMaximized: false,
      x: initialX,
      y: initialY,
      width: meta.defaultWidth,
      height: meta.defaultHeight,
      zIndex: windows.length + 10,
    };

    setWindows(prev => [...prev, newWindow]);
    setActiveWindowId(newWindow.id);
    setIsLauncherOpen(false);
  };

  const closeWindow = (id: string) => {
    playUiSound('closeApp', soundEnabled);
    setWindows(prev => prev.filter(w => w.id !== id));
    if (activeWindowId === id) {
      const remaining = windows.filter(w => w.id !== id);
      if (remaining.length > 0) {
        const highestZ = remaining.reduce((prev, current) => (prev.zIndex > current.zIndex ? prev : current));
        setActiveWindowId(highestZ.id);
      } else {
        setActiveWindowId(null);
      }
    }
  };

  const minimizeWindow = (id: string) => {
    playUiSound('minimize', soundEnabled);
    setWindows(prev => prev.map(w => w.id === id ? { ...w, isMinimized: true } : w));
    if (activeWindowId === id) {
      const activeWindows = windows.filter(w => w.id !== id && !w.isMinimized);
      if (activeWindows.length > 0) {
        const highestZ = activeWindows.reduce((prev, current) => (prev.zIndex > current.zIndex ? prev : current));
        setActiveWindowId(highestZ.id);
      } else {
        setActiveWindowId(null);
      }
    }
  };

  const maximizeWindow = (id: string) => {
    playUiSound('click', soundEnabled);
    setWindows(prev => prev.map(w => w.id === id ? { ...w, isMaximized: !w.isMaximized } : w));
    focusWindow(id);
  };

  const focusWindow = (id: string) => {
    setActiveWindowId(id);
    setWindows(prev => {
      const maxZ = Math.max(10, ...prev.map(w => w.zIndex));
      return prev.map(w => w.id === id ? { ...w, zIndex: maxZ + 1 } : w);
    });
  };

  const updateWindowPos = (id: string, x: number, y: number, width: number, height: number) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, x, y, width, height } : w));
  };

  const completeSetupWizard = () => {
    setShowSetupWizard(false);
    localStorage.setItem('aya_os_setup_completed', 'true');
  };

  const rerunSetupWizard = () => {
    setShowSetupWizard(true);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden select-none font-sans bg-slate-950 text-slate-100 flex flex-col">
      {/* Dynamic Background Wallpaper */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center transition-all duration-700 ease-in-out"
        style={{
          backgroundImage: currentWallpaper.url.startsWith('linear-gradient')
            ? currentWallpaper.url
            : `url(${currentWallpaper.url})`
        }}
      >
        <div className="absolute inset-0 bg-black/20 backdrop-blur-[0.5px]" />
      </div>

      {/* Required Desktop Wallpaper Typography Watermark: "Aya Dev OS" */}
      <div className="absolute inset-0 z-[1] flex flex-col items-center justify-center pointer-events-none select-none">
        <div className="text-center space-y-1 opacity-80 drop-shadow-2xl">
          <span className="inline-block text-xs font-mono font-semibold uppercase tracking-[0.35em] text-cyan-300/80 bg-black/30 backdrop-blur-md px-4 py-1 rounded-full border border-cyan-500/20 shadow-lg">
            Aya Kalimah Satya Ruane • Web OS Environment
          </span>
          <h1 className="text-5xl sm:text-7xl font-black tracking-tighter text-white/90 font-mono drop-shadow-[0_10px_25px_rgba(0,0,0,0.8)]">
            Aya Dev OS
          </h1>
          <p className="text-sm font-medium text-slate-200/90 tracking-widest font-sans drop-shadow-md">
            Aya OS Portfolio Edition
          </p>
        </div>
      </div>

      {/* Top Offline Hotspot Captive Portal Banner */}
      <div className="relative z-10 bg-slate-950/80 border-b border-slate-800/80 px-4 py-1.5 flex items-center justify-between text-xs backdrop-blur-md">
        <div className="flex items-center gap-2 text-cyan-400 font-medium">
          <Wifi className="w-3.5 h-3.5 animate-pulse" />
          <span>Local No-Internet Hotspot Access Point</span>
          <span className="hidden sm:inline-block text-slate-400 font-mono text-[11px] bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
            Node: 192.168.4.1
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={rerunSetupWizard}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5 text-cyan-400" /> Setup Tour
          </button>
          <div className="flex items-center gap-1.5 text-slate-300 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">Created by</span>
            <strong className="text-cyan-300 font-bold">Aya Kalimah Satya Ruane</strong>
          </div>
        </div>
      </div>

      {/* Main Desktop Workspace for Windows */}
      <div className="relative flex-1 z-10 overflow-hidden">
        <WindowManager
          windows={windows}
          activeWindowId={activeWindowId}
          closeWindow={closeWindow}
          minimizeWindow={minimizeWindow}
          maximizeWindow={maximizeWindow}
          focusWindow={focusWindow}
          updateWindowPos={updateWindowPos}
          openApp={openApp}
          soundEnabled={soundEnabled}
          activeWallpaperId={wallpaperId}
          setWallpaper={handleSetWallpaper}
          setSoundEnabled={handleToggleSound}
          rerunSetupWizard={rerunSetupWizard}
        />

        {/* Launcher Overlay */}
        <Launcher
          isOpen={isLauncherOpen}
          onClose={() => setIsLauncherOpen(false)}
          openApp={openApp}
          soundEnabled={soundEnabled}
        />

        {/* Quick Settings Panel */}
        <QuickSettings
          isOpen={isQuickSettingsOpen}
          onClose={() => setIsQuickSettingsOpen(false)}
          soundEnabled={soundEnabled}
          setSoundEnabled={handleToggleSound}
          activeWallpaperId={wallpaperId}
          setWallpaper={handleSetWallpaper}
          openSettingsApp={() => openApp('settings')}
          rerunSetupWizard={rerunSetupWizard}
        />
      </div>

      {/* Chrome OS Bottom Shelf Dock */}
      <Shelf
        windows={windows}
        activeWindowId={activeWindowId}
        isLauncherOpen={isLauncherOpen}
        toggleLauncher={() => {
          playUiSound('click', soundEnabled);
          setIsLauncherOpen(!isLauncherOpen);
          if (isQuickSettingsOpen) setIsQuickSettingsOpen(false);
        }}
        isQuickSettingsOpen={isQuickSettingsOpen}
        toggleQuickSettings={() => {
          playUiSound('click', soundEnabled);
          setIsQuickSettingsOpen(!isQuickSettingsOpen);
          if (isLauncherOpen) setIsLauncherOpen(false);
        }}
        openApp={openApp}
        focusWindow={focusWindow}
        soundEnabled={soundEnabled}
      />

      {/* Interactive First Time Setup Wizard Modal */}
      <SetupWizard
        isOpen={showSetupWizard}
        onComplete={completeSetupWizard}
        soundEnabled={soundEnabled}
        setSoundEnabled={handleToggleSound}
        activeWallpaperId={wallpaperId}
        setWallpaper={handleSetWallpaper}
      />
    </div>
  );
};

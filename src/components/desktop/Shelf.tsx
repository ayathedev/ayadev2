import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  Palette, 
  Music, 
  Folder, 
  Terminal, 
  Sparkles, 
  Gamepad2, 
  FileText, 
  Settings, 
  Wifi, 
  Battery,
  Radio,
  Layers,
  Film,
  HeartHandshake,
  Newspaper,
  Box,
  LayoutGrid,
  Mic
} from 'lucide-react';
import { APPS_METADATA } from '../../data/portfolioData';
import { WindowState, AppId } from '../../types';

interface ShelfProps {
  windows: WindowState[];
  activeWindowId: string | null;
  isLauncherOpen: boolean;
  toggleLauncher: () => void;
  isQuickSettingsOpen: boolean;
  toggleQuickSettings: () => void;
  openApp: (appId: AppId) => void;
  focusWindow: (windowId: string) => void;
  soundEnabled: boolean;
}

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  Globe,
  Palette,
  Music,
  Folder,
  Terminal,
  Sparkles,
  Gamepad2,
  FileText,
  Settings,
  Radio,
  Layers,
  Film,
  HeartHandshake,
  Newspaper,
  Box,
  LayoutGrid,
  Mic,
};

export const Shelf: React.FC<ShelfProps> = ({
  windows,
  activeWindowId,
  isLauncherOpen,
  toggleLauncher,
  isQuickSettingsOpen,
  toggleQuickSettings,
  openApp,
  focusWindow,
}) => {
  const [time, setTime] = useState<string>('');
  const [dateStr, setDateStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setDateStr(now.toLocaleDateString([], { month: 'short', day: 'numeric' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const pinnedApps = APPS_METADATA.filter((app) => app.pinnedToShelf);

  return (
    <div className="fixed bottom-0 left-0 right-0 h-12 z-40 bg-slate-950/85 backdrop-blur-xl border-t border-slate-800/80 flex items-center justify-between px-3 text-slate-100 select-none">
      {/* Left: Chrome OS Launcher Dot */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={toggleLauncher}
          className={`p-2 rounded-full transition-all group relative ${
            isLauncherOpen ? 'bg-cyan-500/20 text-cyan-300' : 'hover:bg-slate-800/80 text-cyan-400 hover:text-white'
          }`}
          title="Aya OS Launcher"
        >
          <div className="w-5 h-5 rounded-full border-2 border-cyan-400 flex items-center justify-center group-hover:bg-cyan-500 group-hover:border-cyan-500 transition-colors">
            <div className="w-2 h-2 bg-cyan-400 rounded-full group-hover:bg-white transition-colors" />
          </div>
        </button>

        <div className="h-4 w-[1px] bg-slate-800 mx-1" />

        {/* Pinned & Active Apps Icons */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          {pinnedApps.map((app) => {
            const IconComponent = ICON_MAP[app.iconName] || Globe;
            const openWindow = windows.find((w) => w.appId === app.id);
            const isOpen = !!openWindow;
            const isActive = openWindow && openWindow.id === activeWindowId && !openWindow.isMinimized;

            return (
              <button
                key={app.id}
                onClick={() => {
                  if (isOpen && openWindow) {
                    focusWindow(openWindow.id);
                  } else {
                    openApp(app.id);
                  }
                }}
                className={`group relative p-1.5 rounded-xl transition-all flex flex-col items-center justify-center ${
                  isActive
                    ? 'bg-slate-800 text-white shadow-sm ring-1 ring-cyan-500/40'
                    : isOpen
                    ? 'hover:bg-slate-800/60 text-slate-200'
                    : 'hover:bg-slate-800/40 text-slate-400 hover:text-slate-200'
                }`}
                title={app.name}
              >
                <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700/80 flex items-center justify-center text-cyan-400 shadow-xs group-hover:scale-105 transition-transform">
                  <IconComponent className="w-4 h-4" />
                </div>

                {/* Active Indicator Dot */}
                {isOpen && (
                  <span
                    className={`absolute -bottom-0.5 w-1.5 h-1.5 rounded-full transition-all ${
                      isActive ? 'bg-cyan-400 w-3' : 'bg-slate-400'
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Right: Quick Settings System Tray */}
      <div className="flex items-center gap-2">
        <button
          onClick={toggleQuickSettings}
          className={`flex items-center gap-2.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-colors ${
            isQuickSettingsOpen
              ? 'bg-cyan-500/20 border-cyan-400/50 text-cyan-200'
              : 'bg-slate-900/80 hover:bg-slate-800 border-slate-800 text-slate-200'
          }`}
        >
          <div className="flex items-center gap-1.5 text-emerald-400">
            <Wifi className="w-3.5 h-3.5" />
            <span className="text-[10px] hidden sm:inline font-mono">192.168.4.1</span>
          </div>

          <div className="h-3 w-[1px] bg-slate-800" />

          <div className="flex items-center gap-1 text-slate-300">
            <Battery className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[10px] hidden md:inline">100%</span>
          </div>

          <div className="h-3 w-[1px] bg-slate-800" />

          <div className="flex items-center gap-1 text-slate-200 font-semibold font-mono text-xs">
            <span>{time}</span>
            <span className="text-[10px] text-slate-400 font-normal hidden sm:inline ml-1">{dateStr}</span>
          </div>
        </button>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Monitor, Crown, Sparkles, Sliders, Film, HardDrive, Image as ImageIcon } from 'lucide-react';

interface MenuBarProps {
  fileName?: string;
  isPro: boolean;
  onPreferences?: () => void;
  onAbout?: () => void;
  onOpenMedia?: () => void;
  onImportDrive?: () => void;
  onImportPhotos?: () => void;
  onClearBuffer?: () => void;
  onToggleFullscreen?: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onResetView?: () => void;
  onAnalyzeVideo?: () => void;
  onUpgradeClick?: () => void;
  onOpenGifStudio?: () => void;
  onOpenEditor?: () => void;
}

const MenuBar: React.FC<MenuBarProps> = ({ 
  fileName,
  isPro,
  onPreferences,
  onAbout,
  onOpenMedia,
  onImportDrive,
  onImportPhotos,
  onClearBuffer,
  onToggleFullscreen,
  onZoomIn,
  onZoomOut,
  onResetView,
  onAnalyzeVideo,
  onUpgradeClick,
  onOpenGifStudio,
  onOpenEditor
}) => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const menus = [
    { label: 'Flow', htmlLabel: <><span className="underline">F</span>low</>, items: ['About Frame Flow', 'Preferences'] },
    { label: 'File', htmlLabel: <><span className="underline">F</span>ile</>, items: ['Open Local Media...', 'Import from Google Drive...', 'Import from Google Photos...', 'Clear Buffer'] },
    { label: 'View', htmlLabel: <><span className="underline">V</span>iew</>, items: ['Toggle Fullscreen', 'Zoom In', 'Zoom Out', 'Reset View'] },
    { label: 'Tools', htmlLabel: <><span className="underline">T</span>ools</>, items: ['Preferences...', 'Import from Google Drive...', 'Import from Google Photos...'] }
  ];

  const handleItemClick = (item: string) => {
    setActiveMenu(null);
    if (!item) return;

    switch (item) {
      case 'About Frame Flow':
        onAbout?.();
        break;
      case 'Preferences':
      case 'Preferences...':
        onPreferences?.();
        break;
      case 'Open Media...':
      case 'Open Local Media...':
        onOpenMedia?.();
        break;
      case 'Import from Google Drive...':
        onImportDrive?.();
        break;
      case 'Import from Google Photos...':
        onImportPhotos?.();
        break;
      case 'Clear Buffer':
        onClearBuffer?.();
        break;
      case 'Toggle Fullscreen':
        onToggleFullscreen?.();
        break;
      case 'Zoom In':
        onZoomIn?.();
        break;
      case 'Zoom Out':
        onZoomOut?.();
        break;
      case 'Reset View':
        onResetView?.();
        break;
      case 'Advanced Photo & Retouch Studio...':
        onOpenEditor?.();
        break;
      case 'AI Vision Tape Scan...':
        onAnalyzeVideo?.();
        break;
      case 'Animated GIF & Teaser Studio...':
        onOpenGifStudio?.();
        break;
      case '👑 Studio Pro Active':
      case '⚡ Upgrade to Studio Pro':
        onUpgradeClick?.();
        break;
      default:
        break;
    }
  };

  return (
    <nav className="h-8 flex items-center px-3 justify-between relative z-[300] text-xs font-normal bg-white border-b border-gray-200 select-none text-black">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 mr-2">
          <Monitor className="w-4 h-4 text-zinc-700" />
          <span className="font-bold text-gray-900">FrameFlow</span>
        </div>

        {menus.map((menu) => (
          <div key={menu.label} className="relative">
            <button 
              className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
                activeMenu === menu.label 
                  ? 'bg-gray-100 text-zinc-900' 
                  : 'text-gray-700 hover:bg-gray-100 hover:text-black'
              }`}
              onClick={() => setActiveMenu(activeMenu === menu.label ? null : menu.label)}
            >
              {menu.htmlLabel}
            </button>
            
            {activeMenu === menu.label && (
              <div className="absolute top-full left-0 mt-1 min-w-[200px] bg-white rounded-xl border border-gray-200 shadow-xl z-[400] p-1 animate-in fade-in duration-100">
                {menu.items.map((item) => (
                  <button
                    key={item}
                    className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium text-gray-800 hover:bg-zinc-100 hover:text-zinc-900 transition-colors flex items-center justify-between"
                    onClick={() => handleItemClick(item)}
                  >
                    <span>{item}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Right Area: Video Info */}
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-gray-500">
          <span className="truncate max-w-[180px] bg-gray-100 px-2 py-0.5 rounded-md text-gray-700 font-mono text-[11px]">
            {fileName || 'No Source Loaded'}
          </span>
        </div>
      </div>

      {activeMenu && (
        <div className="fixed inset-0 z-[-1]" onClick={() => setActiveMenu(null)} />
      )}
    </nav>
  );
};

export default MenuBar;

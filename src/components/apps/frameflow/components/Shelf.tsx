
import React from 'react';
import { Settings, Monitor, HardDrive, Image as ImageIcon, Cloud } from 'lucide-react';

interface ShelfProps {
  onSettings: () => void;
  onHelp: () => void;
  onImportCloud?: () => void;
  onExportAll?: () => void;
  onOpenEditor?: () => void;
  frameCount: number;
  isExporting?: boolean;
}

const Shelf: React.FC<ShelfProps> = ({ 
  onSettings, 
  onHelp, 
  onImportCloud,
  onExportAll, 
  onOpenEditor, 
  frameCount,
  isExporting 
}) => {
  const [time, setTime] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <footer className="h-10 flex items-center px-2 justify-between relative w-full shrink-0 z-[20] bg-white border-t border-gray-200 select-none text-black text-xs font-normal shadow-sm">
      {/* Left Area: Start Button & Tasks */}
      <div className="flex items-center gap-1.5">
        {/* Classic Win95 Start Button */}
        <button 
          onClick={onHelp}
          className="h-7 px-2 flex items-center gap-1.5 font-bold text-xs bg-white border-gray-200 rounded-md border active:scale-95 transition-transform shadow-sm"
        >
          {/* Windows-like tiny icon representation */}
          <div className="w-4 h-4 bg-zinc-900 rounded-[2px] flex items-center justify-center text-[10px] text-white font-bold select-none leading-none shadow-xs">
            田
          </div>
          <span className="tracking-normal">Shortcuts</span>
        </button>
        
        {/* Divider */}
        <div className="h-6 w-[2px] bg-gray-300 mx-1" />

        {/* Active Application Task Buttons */}
        <div className="flex items-center gap-1">
          {/* FlowPlayer - actively selected task */}
          <div className="h-7 px-2.5 min-w-[120px] bg-gray-100 border-gray-200 border rounded-md flex items-center gap-2 select-none font-bold text-sm shadow-xs">
            <Monitor className="w-3.5 h-3.5 text-zinc-700" />
            <span>FlowPlayer</span>
          </div>

          <button 
            onClick={onSettings}
            className="h-7 px-2.5 min-w-[100px] bg-white border-gray-200 rounded-md border flex items-center gap-2 active:scale-95 transition-transform text-xs font-semibold hover:bg-gray-50 shadow-xs"
          >
            <Settings className="w-3.5 h-3.5 text-zinc-700" />
            <span>Settings</span>
          </button>

          {onImportCloud && (
            <button 
              onClick={onImportCloud}
              className="h-7 px-2.5 min-w-[110px] bg-white border-gray-200 rounded-md border flex items-center gap-1.5 active:scale-95 transition-transform text-xs font-semibold hover:bg-blue-50/50 hover:border-blue-200 text-gray-800 shadow-xs"
              title="Import video footage from Google Drive or Google Photos"
            >
              <Cloud className="w-3.5 h-3.5 text-blue-600" />
              <span>Cloud Import</span>
            </button>
          )}
        </div>
      </div>

      {/* Center Area: Copyright Badge */}
      <div className="hidden lg:flex items-center text-[11px] font-medium text-zinc-500 select-none">
        <span>Copyright &copy; 2026 Aya Kalimah Satya Ruane</span>
      </div>

      {/* Right Area: System Tray */}
      <div className="flex items-center gap-2">
        {/* Export All Button */}
        {frameCount > 0 && (
          <button 
            onClick={onExportAll}
            disabled={isExporting}
            className={`h-7 px-2 border flex items-center gap-1.5 shadow-sm font-bold text-xs ${
              isExporting 
                ? 'bg-gray-100 border-gray-200 opacity-70 cursor-wait' 
                : 'bg-white border-gray-200 rounded-md active:scale-95 transition-transform hover:bg-gray-50'
            }`}
          >
            <HardDrive className={`w-3 h-3 ${isExporting ? 'text-gray-500 animate-pulse' : 'text-zinc-700'}`} />
            <span>{isExporting ? 'ZIPPING...' : 'EXPORT ALL'}</span>
          </button>
        )}

        {/* Custom stats indicator */}
        <div className="h-7 px-2 bg-gray-100 border-gray-200 border rounded-md flex items-center gap-1.5 shadow-xs font-sans text-xs">
          <HardDrive className="w-3 h-3 text-zinc-600" />
          <span>BUFFER: {frameCount} FRAMES</span>
        </div>

        {/* System Clock & Notification Area */}
        <div className="h-7 px-3 bg-gray-100 border-gray-200 border flex items-center gap-3 shadow-sm text-sm font-medium font-sans">
          {/* Custom speaker icon */}
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-2.5 bg-black" />
            <div className="w-2.5 h-1.5 border-black border-l-0" />
          </div>
          <span>
            {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Shelf;

import React, { useState, useRef, useEffect } from 'react';
import { Minus, Square, Copy, X, Globe, Palette, Music, Folder, Terminal, Bot, Gamepad2, StickyNote, Settings, Radio, Layers, Mic, Bike, Move, PanelLeft, PanelRight } from 'lucide-react';
import { WindowState } from '../../types';

interface WindowProps {
  window: WindowState;
  isActive: boolean;
  onFocus: () => void;
  onClose: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  onUpdatePosition: (x: number, y: number) => void;
  onUpdateSize: (w: number, h: number) => void;
  onSnap: (side: 'left' | 'right' | null) => void;
  children: React.ReactNode;
}

const ICON_MAP: Record<string, any> = {
  Globe,
  Palette,
  Music,
  Folder,
  Terminal,
  Bot,
  Gamepad2,
  StickyNote,
  Settings,
  Radio,
  Layers,
  Mic,
  Bike,
};

export const Window: React.FC<WindowProps> = ({
  window,
  isActive,
  onFocus,
  onClose,
  onMinimize,
  onMaximize,
  onUpdatePosition,
  onUpdateSize,
  onSnap,
  children,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState<string | null>(null);
  const dragStartRef = useRef<{ x: number; y: number; winX: number; winY: number }>({ x: 0, y: 0, winX: 0, winY: 0 });
  const resizeStartRef = useRef<{ x: number; y: number; w: number; h: number; winX: number; winY: number }>({
    x: 0,
    y: 0,
    w: 0,
    h: 0,
    winX: 0,
    winY: 0
  });

  const IconComponent = ICON_MAP[window.iconName || (window as any).icon] || Globe;

  // Drag logic
  const handleTitleMouseDown = (e: React.MouseEvent) => {
    if (window.isMaximized) return;
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      winX: window.x,
      winY: window.y
    };
    onFocus();
  };

  // Resize logic
  const handleResizeMouseDown = (e: React.MouseEvent, direction: string) => {
    e.stopPropagation();
    if (window.isMaximized) return;
    setIsResizing(direction);
    resizeStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      w: window.width,
      h: window.height,
      winX: window.x,
      winY: window.y
    };
    onFocus();
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const dx = e.clientX - dragStartRef.current.x;
        const dy = e.clientY - dragStartRef.current.y;
        let newX = dragStartRef.current.winX + dx;
        let newY = Math.max(32, dragStartRef.current.winY + dy); // Don't drag above captive bar

        // Snap preview trigger near screen edges
        if (e.clientX < 20) {
          onSnap('left');
        } else if (e.clientX > globalThis.innerWidth - 20) {
          onSnap('right');
        } else {
          if (window.snapState) onSnap(null);
        }

        onUpdatePosition(newX, newY);
      } else if (isResizing) {
        const dx = e.clientX - resizeStartRef.current.x;
        const dy = e.clientY - resizeStartRef.current.y;

        let newW = resizeStartRef.current.w;
        let newH = resizeStartRef.current.h;
        let newX = resizeStartRef.current.winX;
        let newY = resizeStartRef.current.winY;

        if (isResizing.includes('r')) newW = Math.max(400, resizeStartRef.current.w + dx);
        if (isResizing.includes('b')) newH = Math.max(300, resizeStartRef.current.h + dy);
        if (isResizing.includes('l')) {
          const possibleW = resizeStartRef.current.w - dx;
          if (possibleW > 400) {
            newW = possibleW;
            newX = resizeStartRef.current.winX + dx;
          }
        }
        if (isResizing.includes('t')) {
          const possibleH = resizeStartRef.current.h - dy;
          if (possibleH > 300) {
            newH = possibleH;
            newY = resizeStartRef.current.winY + dy;
          }
        }

        onUpdateSize(newW, newH);
        onUpdatePosition(newX, newY);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(null);
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, window.snapState]);

  if (window.isMinimized) return null;

  // Window styling calculated based on maximized or snapped state
  let windowStyle: React.CSSProperties = {
    zIndex: window.zIndex,
  };

  if (window.isMaximized) {
    windowStyle = {
      ...windowStyle,
      top: 32,
      left: 0,
      width: '100%',
      height: 'calc(100vh - 80px)',
      borderRadius: 0
    };
  } else if (window.snapState === 'left') {
    windowStyle = {
      ...windowStyle,
      top: 32,
      left: 0,
      width: '50%',
      height: 'calc(100vh - 80px)',
      borderRadius: 0
    };
  } else if (window.snapState === 'right') {
    windowStyle = {
      ...windowStyle,
      top: 32,
      left: '50%',
      width: '50%',
      height: 'calc(100vh - 80px)',
      borderRadius: 0
    };
  } else {
    windowStyle = {
      ...windowStyle,
      top: window.y,
      left: window.x,
      width: window.width,
      height: window.height,
    };
  }

  return (
    <div
      onClick={onFocus}
      style={windowStyle}
      className={`fixed flex flex-col bg-slate-900/95 backdrop-blur-2xl border transition-shadow duration-150 ${
        isActive
          ? 'border-slate-600 shadow-2xl ring-1 ring-blue-500/30'
          : 'border-slate-800/80 shadow-lg opacity-95'
      } rounded-2xl overflow-hidden`}
    >
      {/* Titlebar / Header */}
      <div
        onMouseDown={handleTitleMouseDown}
        className={`h-11 px-3.5 flex items-center justify-between select-none cursor-grab active:cursor-grabbing border-b transition-colors ${
          isActive ? 'bg-slate-800/90 border-slate-700/60' : 'bg-slate-900/80 border-slate-800'
        }`}
      >
        {/* Left Title & Icon */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-1 rounded-md bg-blue-500/20 text-blue-400">
            <IconComponent className="w-4 h-4" />
          </div>
          <span className="text-xs font-semibold text-slate-100 truncate">
            {window.title}
          </span>
        </div>

        {/* Right Window Controls (Chrome OS standard) */}
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSnap(window.snapState === 'left' ? null : 'left');
            }}
            className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-700/60 rounded-md transition-colors hidden sm:block"
            title="Snap Left 50%"
          >
            <PanelLeft className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onSnap(window.snapState === 'right' ? null : 'right');
            }}
            className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-700/60 rounded-md transition-colors hidden sm:block"
            title="Snap Right 50%"
          >
            <PanelRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onMinimize();
            }}
            className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-700/60 rounded-md transition-colors"
            title="Minimize"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onMaximize();
            }}
            className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-700/60 rounded-md transition-colors"
            title={window.isMaximized ? 'Restore' : 'Maximize'}
          >
            {window.isMaximized ? <Copy className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-rose-600 rounded-md transition-colors ml-1"
            title="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Body Content */}
      <div className="flex-1 overflow-hidden relative text-slate-100 bg-slate-950">
        {children}
      </div>

      {/* Resize Handles (Only when not maximized or snapped) */}
      {!window.isMaximized && !window.snapState && (
        <>
          <div
            onMouseDown={(e) => handleResizeMouseDown(e, 'r')}
            className="absolute top-0 right-0 w-1.5 h-full cursor-e-resize hover:bg-blue-500/40"
          />
          <div
            onMouseDown={(e) => handleResizeMouseDown(e, 'b')}
            className="absolute bottom-0 left-0 w-full h-1.5 cursor-s-resize hover:bg-blue-500/40"
          />
          <div
            onMouseDown={(e) => handleResizeMouseDown(e, 'br')}
            className="absolute bottom-0 right-0 w-3 h-3 cursor-se-resize hover:bg-blue-500"
          />
        </>
      )}
    </div>
  );
};

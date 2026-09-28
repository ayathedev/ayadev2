import React, { useRef, useState, useEffect } from 'react';
import { Palette, Brush, Eraser, Sparkles, Download, Trash2, Undo, Circle, Layers, Image as ImageIcon } from 'lucide-react';

export const CanvasStudioApp: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<'brush' | 'eraser' | 'symmetry' | 'neon'>('brush');
  const [color, setColor] = useState('#3b82f6');
  const [lineWidth, setLineWidth] = useState(6);
  const [history, setHistory] = useState<ImageData[]>([]);

  // Initialize canvas size
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set resolution
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width || 800;
    canvas.height = rect.height || 500;

    // Fill background with dark canvas
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Save initial state
    const initialState = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory([initialState]);
  }, []);

  const saveState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const currentState = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory((prev) => [...prev.slice(-15), currentState]); // Keep last 15 steps
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    draw(e);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (tool === 'eraser') {
      ctx.strokeStyle = '#090d16';
      ctx.lineWidth = lineWidth * 2;
      ctx.lineTo(x, y);
      ctx.stroke();
    } else if (tool === 'brush') {
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.lineTo(x, y);
      ctx.stroke();
    } else if (tool === 'neon') {
      ctx.shadowBlur = 12;
      ctx.shadowColor = color;
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.lineTo(x, y);
      ctx.stroke();
    } else if (tool === 'symmetry') {
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;

      // 4-way symmetry math
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const dx = x - cx;
      const dy = y - cy;

      ctx.beginPath();
      ctx.arc(cx + dx, cy + dy, lineWidth / 2, 0, Math.PI * 2);
      ctx.arc(cx - dx, cy + dy, lineWidth / 2, 0, Math.PI * 2);
      ctx.arc(cx + dx, cy - dy, lineWidth / 2, 0, Math.PI * 2);
      ctx.arc(cx - dx, cy - dy, lineWidth / 2, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
    }
  };

  const handleMouseUp = () => {
    if (isDrawing) {
      setIsDrawing(false);
      saveState();
    }
  };

  const handleUndo = () => {
    if (history.length <= 1) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const newHistory = [...history];
    newHistory.pop(); // Remove current
    const previousState = newHistory[newHistory.length - 1];
    ctx.putImageData(previousState, 0, 0);
    setHistory(newHistory);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveState();
  };

  const loadPresetArtwork = (preset: 'grid' | 'sunset' | 'cyber') => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (preset === 'grid') {
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += 30) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
      // Glowing central node
      ctx.shadowBlur = 20;
      ctx.shadowColor = '#3b82f6';
      ctx.strokeStyle = '#60a5fa';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2, 80, 0, Math.PI * 2);
      ctx.stroke();
    } else if (preset === 'sunset') {
      const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      grad.addColorStop(0, '#31104b');
      grad.addColorStop(0.5, '#4c0519');
      grad.addColorStop(1, '#0f172a');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Sun
      ctx.shadowBlur = 30;
      ctx.shadowColor = '#f43f5e';
      ctx.fillStyle = '#fb7185';
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2 + 20, 90, 0, Math.PI * 2);
      ctx.fill();
    } else if (preset === 'cyber') {
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < 20; i++) {
        ctx.shadowBlur = 15;
        ctx.shadowColor = i % 2 === 0 ? '#10b981' : '#8b5cf6';
        ctx.strokeStyle = i % 2 === 0 ? '#34d399' : '#a78bfa';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(
          Math.random() * canvas.width,
          Math.random() * canvas.height,
          Math.random() * 60 + 10,
          0,
          Math.PI * 2
        );
        ctx.stroke();
      }
    }
    saveState();
  };

  const handleExport = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `Canvas_Artwork_${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 text-slate-100 font-sans">
      {/* Top Toolbar */}
      <div className="h-12 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-3 gap-2 overflow-x-auto no-scrollbar shrink-0">
        {/* Tools */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setTool('brush')}
            className={`p-2 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors ${
              tool === 'brush' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Brush className="w-3.5 h-3.5" />
            <span>Brush</span>
          </button>

          <button
            onClick={() => setTool('neon')}
            className={`p-2 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors ${
              tool === 'neon' ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Neon Glow</span>
          </button>

          <button
            onClick={() => setTool('symmetry')}
            className={`p-2 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors ${
              tool === 'symmetry' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Circle className="w-3.5 h-3.5" />
            <span>Symmetry</span>
          </button>

          <button
            onClick={() => setTool('eraser')}
            className={`p-2 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors ${
              tool === 'eraser' ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Eraser className="w-3.5 h-3.5" />
            <span>Eraser</span>
          </button>
        </div>

        {/* Color Palette & Brush Size */}
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-7 h-7 rounded-lg bg-transparent border-0 cursor-pointer"
            title="Color Picker"
          />

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Size:</span>
            <input
              type="range"
              min="2"
              max="40"
              value={lineWidth}
              onChange={(e) => setLineWidth(Number(e.target.value))}
              className="w-20 accent-blue-500"
            />
            <span className="font-mono text-[11px] w-5 text-slate-200">{lineWidth}px</span>
          </div>
        </div>

        {/* Actions & Presets */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => loadPresetArtwork('cyber')}
            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-[11px] font-medium"
          >
            Preset: Cyber
          </button>
          <button
            onClick={() => loadPresetArtwork('sunset')}
            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-[11px] font-medium"
          >
            Preset: Sunset
          </button>

          <div className="h-4 w-[1px] bg-slate-800 mx-1" />

          <button
            onClick={handleUndo}
            disabled={history.length <= 1}
            className="p-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 rounded-xl text-slate-300"
            title="Undo"
          >
            <Undo className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleClear}
            className="p-2 bg-slate-800 hover:bg-rose-900/60 hover:text-rose-300 rounded-xl text-slate-300"
            title="Clear Canvas"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleExport}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export PNG</span>
          </button>
        </div>
      </div>

      {/* Canvas Viewport */}
      <div className="flex-1 overflow-hidden relative flex items-center justify-center p-2 bg-slate-950">
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={draw}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="w-full h-full border border-slate-800 rounded-2xl cursor-crosshair shadow-2xl"
        />
      </div>
    </div>
  );
};

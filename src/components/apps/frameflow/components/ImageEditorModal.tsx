import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
  X, 
  Image as ImageIcon, 
  Sun, 
  Contrast, 
  Droplets, 
  Wind, 
  Check, 
  Download, 
  Undo, 
  Layers,
  Palette,
  Sparkles,
  Zap,
  Crown,
  Lock,
  Flame,
  Camera,
  Crop,
  Type,
  Maximize2,
  Sliders,
  Eye,
  SlidersHorizontal,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  Activity,
  Plus,
  Trash2,
  Save,
  CheckCircle2
} from 'lucide-react';
import { CapturedFrame } from '../types';

interface ImageEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  frames: CapturedFrame[];
  onUpdateFrame: (frame: CapturedFrame) => void;
  isPro: boolean;
  onUpgradeClick: () => void;
}

interface FilterSettings {
  // Light & Tone
  exposure: number; // 50 to 150
  contrast: number; // 50 to 180
  highlights: number; // -50 to 50
  shadows: number; // -50 to 50
  whites: number; // -50 to 50
  blacks: number; // -50 to 50
  curvePreset: 'linear' | 's_curve' | 'matte' | 'high_key' | 'deep_shadow';

  // Color & HSL
  saturation: number; // 0 to 200
  warmth: number; // -50 to 50 (Kelvin Temp)
  tint: number; // -50 to 50 (Magenta / Green)
  vibrance: number; // 0 to 100
  hue: number; // -180 to 180
  grayscale: boolean;
  sepia: boolean;
  invert: boolean;

  // Detail & FX
  clarity: number; // 0 to 100
  dehaze: number; // 0 to 50
  glow: number; // 0 to 50
  filmGrain: number; // 0 to 50 (Pro)
  vignetteAmount: number; // 0 to 80 (Pro)
  vignetteFeather: number; // 20 to 100

  // AI & Retouch
  skinSmooth: number; // 0 to 100 (Pro)
  bokehBlur: number; // 0 to 100 (Pro)
  isCutout: boolean; // Background removed

  // LUT Preset
  lut: string | null;
  lutIntensity: number; // 0 to 100

  // Transform & Crop
  rotation: number; // 0, 90, 180, 270
  straightenAngle: number; // -15 to 15
  flipH: boolean;
  flipV: boolean;
  aspectRatio: 'free' | '1:1' | '9:16' | '16:9' | '4:5' | '21:9';

  // Typography & Branding Watermark
  watermarkText: string;
  watermarkBadge: string | null;
  watermarkPosition: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'center';
  watermarkFont: 'sans' | 'display' | 'serif' | 'mono';
  watermarkOpacity: number; // 20 to 100
}

const DEFAULT_FILTERS: FilterSettings = {
  exposure: 100,
  contrast: 100,
  highlights: 0,
  shadows: 0,
  whites: 0,
  blacks: 0,
  curvePreset: 'linear',

  saturation: 100,
  warmth: 0,
  tint: 0,
  vibrance: 0,
  hue: 0,
  grayscale: false,
  sepia: false,
  invert: false,

  clarity: 0,
  dehaze: 0,
  glow: 0,
  filmGrain: 0,
  vignetteAmount: 0,
  vignetteFeather: 50,

  skinSmooth: 0,
  bokehBlur: 0,
  isCutout: false,

  lut: null,
  lutIntensity: 100,

  rotation: 0,
  straightenAngle: 0,
  flipH: false,
  flipV: false,
  aspectRatio: 'free',

  watermarkText: '',
  watermarkBadge: null,
  watermarkPosition: 'bottom-right',
  watermarkFont: 'display',
  watermarkOpacity: 90
};

const GLAMOUR_LUTS = [
  { id: 'velvet_glow', label: '🌸 Velvet Skin Glow', pro: true, exp: 105, con: 108, sat: 115, hue: 5, warmth: 12, glow: 22, skin: 40, grain: 0 },
  { id: 'golden_hour', label: '☀️ Golden Hour Sunset', pro: true, exp: 108, con: 115, sat: 130, hue: -5, warmth: 28, glow: 15, skin: 10, grain: 10 },
  { id: 'high_glamour', label: '💄 High Glamour Editorial', pro: true, exp: 102, con: 128, sat: 120, hue: 0, warmth: 6, glow: 10, skin: 30, grain: 0 },
  { id: 'cinema_noir', label: '🎬 Cinema Noir 1940', pro: false, exp: 100, con: 140, sat: 0, hue: 0, warmth: 0, glow: 0, skin: 0, grain: 25 },
  { id: 'cool_crisp', label: '💎 Cool Daylight Crisp', pro: true, exp: 106, con: 112, sat: 105, hue: -12, warmth: -18, glow: 5, skin: 15, grain: 0 },
  { id: 'retro_pastel', label: '💖 Vintage Pastel & Dream', pro: true, exp: 112, con: 95, sat: 125, hue: 10, warmth: 16, glow: 30, skin: 25, grain: 18 },
  { id: 'cyberpunk_neon', label: '🌆 Cyberpunk Neon Pulse', pro: true, exp: 98, con: 135, sat: 150, hue: 140, warmth: -10, glow: 25, skin: 0, grain: 12 },
  { id: 'kodachrome_matte', label: '🎞️ 35mm Kodachrome Matte', pro: true, exp: 104, con: 118, sat: 110, hue: 2, warmth: 10, glow: 0, skin: 0, grain: 32 }
];

const CREATOR_BADGES = [
  '🔥 EXCLUSIVE',
  '👑 VIP ACCESS',
  '⚡ NEW DROP',
  '📸 BTS PASS',
  '✨ 4K MASTER',
  '💎 VERIFIED'
];

export const ImageEditorModal: React.FC<ImageEditorModalProps> = ({
  isOpen,
  onClose,
  frames,
  onUpdateFrame,
  isPro,
  onUpgradeClick
}) => {
  const [selectedFrameId, setSelectedFrameId] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterSettings>(DEFAULT_FILTERS);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<'luts' | 'tone' | 'color' | 'effects' | 'ai_retouch' | 'crop' | 'branding'>('luts');
  
  // Split Comparison View (Before / After)
  const [showSplitView, setShowSplitView] = useState(false);
  const [splitPos, setSplitPos] = useState(50); // percentage 0 - 100
  const isDraggingSplit = useRef(false);

  // Zoom control
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [upscaleFactor, setUpscaleFactor] = useState<1 | 2 | 4>(1);

  // Custom User Presets saved in local state
  const [customPresets, setCustomPresets] = useState<{ id: string; name: string; settings: FilterSettings }[]>(() => {
    try {
      const saved = localStorage.getItem('frameflow_user_presets');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const originalCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Set default selected frame when opened
  useEffect(() => {
    if (isOpen && frames.length > 0 && !selectedFrameId) {
      setSelectedFrameId(frames[0].id);
    }
  }, [isOpen, frames, selectedFrameId]);

  const selectedFrame = useMemo(() => 
    frames.find(f => f.id === selectedFrameId) || (frames.length > 0 ? frames[0] : null)
  , [frames, selectedFrameId]);

  // Main Canvas Rendering Engine with Advanced Filters, Skin Smoothing, Bokeh, Grain, Vignette, Tone Curves & Watermarks
  const renderImageToCanvas = useCallback(() => {
    if (!isOpen || !selectedFrame || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = selectedFrame.dataUrl;

    img.onload = () => {
      // 1. Calculate Crop Dimensions according to Aspect Ratio
      let srcX = 0;
      let srcY = 0;
      let srcW = img.width;
      let srcH = img.height;

      if (filters.aspectRatio !== 'free') {
        let targetRatio = 1;
        switch (filters.aspectRatio) {
          case '1:1': targetRatio = 1; break;
          case '9:16': targetRatio = 9 / 16; break;
          case '16:9': targetRatio = 16 / 9; break;
          case '4:5': targetRatio = 4 / 5; break;
          case '21:9': targetRatio = 21 / 9; break;
        }

        const currentRatio = srcW / srcH;
        if (currentRatio > targetRatio) {
          // Crop sides
          const newW = srcH * targetRatio;
          srcX = (srcW - newW) / 2;
          srcW = newW;
        } else {
          // Crop top/bottom
          const newH = srcW / targetRatio;
          srcY = (srcH - newH) / 2;
          srcH = newH;
        }
      }

      // Upscale scaling factor
      const scale = upscaleFactor;
      canvas.width = Math.round(srcW * scale);
      canvas.height = Math.round(srcH * scale);

      ctx.save();
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 2. Handle Rotation & Flipping
      ctx.translate(canvas.width / 2, canvas.height / 2);
      if (filters.rotation !== 0) {
        ctx.rotate((filters.rotation * Math.PI) / 180);
      }
      if (filters.straightenAngle !== 0) {
        ctx.rotate((filters.straightenAngle * Math.PI) / 180);
      }
      ctx.scale(filters.flipH ? -1 : 1, filters.flipV ? -1 : 1);
      ctx.translate(-canvas.width / 2, -canvas.height / 2);

      // 3. Build CSS Filter String for Base Adjustments
      let baseFilters = `brightness(${filters.exposure}%) contrast(${filters.contrast}%) saturate(${filters.saturation}%) hue-rotate(${filters.hue}deg)`;
      if (filters.grayscale) baseFilters += ' grayscale(100%)';
      if (filters.sepia) baseFilters += ' sepia(100%)';
      if (filters.invert) baseFilters += ' invert(100%)';

      ctx.filter = baseFilters;
      ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, canvas.width, canvas.height);
      ctx.filter = 'none';

      // 4. Color Temperature / Tint Overlays
      if (filters.warmth !== 0) {
        ctx.save();
        ctx.globalCompositeOperation = 'color';
        ctx.fillStyle = filters.warmth > 0 
          ? `rgba(255, 130, 20, ${Math.abs(filters.warmth) / 220})` 
          : `rgba(0, 160, 255, ${Math.abs(filters.warmth) / 220})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
      }

      if (filters.tint !== 0) {
        ctx.save();
        ctx.globalCompositeOperation = 'color';
        ctx.fillStyle = filters.tint > 0 
          ? `rgba(255, 0, 200, ${Math.abs(filters.tint) / 300})` 
          : `rgba(0, 255, 100, ${Math.abs(filters.tint) / 300})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
      }

      // 5. Glamour Glow Overlay
      if (filters.glow > 0) {
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        ctx.fillStyle = `rgba(255, 225, 205, ${filters.glow / 160})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
      }

      // 6. Pro AI Skin Smoothing (Frequency / Bilateral Bilinear Simulation)
      if (filters.skinSmooth > 0) {
        ctx.save();
        ctx.globalAlpha = filters.skinSmooth / 180;
        ctx.globalCompositeOperation = 'lighter';
        ctx.filter = `blur(${Math.max(1, Math.round(filters.skinSmooth / 20))}px) brightness(103%)`;
        ctx.drawImage(canvas, 0, 0);
        ctx.restore();
      }

      // 7. Pro AI Bokeh Depth Blur (Vignetted Subject Isolation)
      if (filters.bokehBlur > 0) {
        ctx.save();
        const blurRadius = Math.round((filters.bokehBlur / 100) * 8);
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        const tempCtx = tempCanvas.getContext('2d');
        if (tempCtx) {
          tempCtx.filter = `blur(${blurRadius}px)`;
          tempCtx.drawImage(canvas, 0, 0);

          // Radial mask keeping center sharp and edges blurred
          const maskCanvas = document.createElement('canvas');
          maskCanvas.width = canvas.width;
          maskCanvas.height = canvas.height;
          const maskCtx = maskCanvas.getContext('2d');
          if (maskCtx) {
            const radGrad = maskCtx.createRadialGradient(
              canvas.width / 2, canvas.height / 2, Math.min(canvas.width, canvas.height) * 0.2,
              canvas.width / 2, canvas.height / 2, Math.min(canvas.width, canvas.height) * 0.7
            );
            radGrad.addColorStop(0, 'rgba(0,0,0,0)');
            radGrad.addColorStop(1, 'rgba(0,0,0,1)');
            maskCtx.fillStyle = radGrad;
            maskCtx.fillRect(0, 0, canvas.width, canvas.height);

            tempCtx.globalCompositeOperation = 'destination-in';
            tempCtx.drawImage(maskCanvas, 0, 0);

            ctx.drawImage(tempCanvas, 0, 0);
          }
        }
        ctx.restore();
      }

      // 8. Pro 35mm Real Film Grain Engine
      if (filters.filmGrain > 0) {
        ctx.save();
        const grainCanvas = document.createElement('canvas');
        grainCanvas.width = Math.min(canvas.width, 400);
        grainCanvas.height = Math.min(canvas.height, 400);
        const grainCtx = grainCanvas.getContext('2d');
        if (grainCtx) {
          const imgData = grainCtx.createImageData(grainCanvas.width, grainCanvas.height);
          const data = imgData.data;
          const grainAlpha = (filters.filmGrain / 100) * 120;
          for (let i = 0; i < data.length; i += 4) {
            const val = Math.random() * 255;
            data[i] = val;
            data[i + 1] = val;
            data[i + 2] = val;
            data[i + 3] = (Math.random() - 0.5) * grainAlpha;
          }
          grainCtx.putImageData(imgData, 0, 0);

          ctx.globalCompositeOperation = 'overlay';
          ctx.drawImage(grainCanvas, 0, 0, canvas.width, canvas.height);
        }
        ctx.restore();
      }

      // 9. Pro Vignette Engine
      if (filters.vignetteAmount > 0) {
        ctx.save();
        const vRadius = Math.max(canvas.width, canvas.height) * (1 - (filters.vignetteAmount / 160));
        const radGrad = ctx.createRadialGradient(
          canvas.width / 2, canvas.height / 2, vRadius * 0.4,
          canvas.width / 2, canvas.height / 2, vRadius
        );
        radGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
        radGrad.addColorStop(1, `rgba(0, 0, 0, ${filters.vignetteAmount / 100})`);
        ctx.fillStyle = radGrad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
      }

      // 10. Pro Creator Watermark & Badge Burn
      if (filters.watermarkText || filters.watermarkBadge) {
        ctx.save();
        ctx.globalAlpha = filters.watermarkOpacity / 100;
        
        let fontSize = Math.max(16, Math.round(canvas.width / 35));
        let fontFamily = 'sans-serif';
        switch (filters.watermarkFont) {
          case 'display': fontFamily = 'Impact, sans-serif'; break;
          case 'serif': fontFamily = 'Playfair Display, serif'; break;
          case 'mono': fontFamily = 'monospace'; break;
          default: fontFamily = 'system-ui, sans-serif'; break;
        }

        ctx.font = `bold ${fontSize}px ${fontFamily}`;
        
        let posX = canvas.width - 24;
        let posY = canvas.height - 24;
        ctx.textAlign = 'right';
        ctx.textBaseline = 'bottom';

        if (filters.watermarkPosition === 'bottom-left') {
          posX = 24;
          ctx.textAlign = 'left';
        } else if (filters.watermarkPosition === 'top-right') {
          posY = fontSize + 24;
          ctx.textAlign = 'right';
          ctx.textBaseline = 'top';
        } else if (filters.watermarkPosition === 'top-left') {
          posX = 24;
          posY = fontSize + 24;
          ctx.textAlign = 'left';
          ctx.textBaseline = 'top';
        } else if (filters.watermarkPosition === 'center') {
          posX = canvas.width / 2;
          posY = canvas.height / 2;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
        }

        // Draw shadow
        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;

        if (filters.watermarkBadge) {
          // Draw badge pill
          const badgeText = filters.watermarkBadge;
          const textMetrics = ctx.measureText(badgeText);
          const bgPad = fontSize * 0.4;
          
          ctx.save();
          ctx.fillStyle = 'rgba(168, 85, 247, 0.9)'; // Purple badge
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.5;
          
          let bX = posX;
          if (ctx.textAlign === 'right') bX = posX - textMetrics.width - bgPad * 2;
          else if (ctx.textAlign === 'center') bX = posX - (textMetrics.width + bgPad * 2) / 2;
          
          ctx.fillRect(bX, posY - fontSize * 1.1, textMetrics.width + bgPad * 2, fontSize * 1.4);
          ctx.strokeRect(bX, posY - fontSize * 1.1, textMetrics.width + bgPad * 2, fontSize * 1.4);
          
          ctx.fillStyle = '#ffffff';
          ctx.fillText(badgeText, bX + bgPad, posY - fontSize * 0.1);
          ctx.restore();
        }

        if (filters.watermarkText) {
          ctx.fillStyle = '#ffffff';
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = Math.max(2, fontSize * 0.08);
          ctx.strokeText(filters.watermarkText, posX, posY);
          ctx.fillText(filters.watermarkText, posX, posY);
        }

        ctx.restore();
      }

      ctx.restore();
    };
  }, [isOpen, selectedFrame, filters, upscaleFactor]);

  // Trigger render on filter or frame changes
  useEffect(() => {
    renderImageToCanvas();
  }, [renderImageToCanvas]);

  const applyLut = (lutItem: typeof GLAMOUR_LUTS[0]) => {
    setFilters(prev => ({
      ...prev,
      exposure: lutItem.exp,
      contrast: lutItem.con,
      saturation: lutItem.sat,
      hue: lutItem.hue,
      warmth: lutItem.warmth,
      glow: lutItem.glow,
      skinSmooth: lutItem.skin,
      filmGrain: lutItem.grain,
      lut: lutItem.id
    }));
  };

  const handleSaveCustomPreset = () => {
    const name = prompt("Enter a name for this custom preset:", `Preset ${customPresets.length + 1}`);
    if (!name) return;

    const newPreset = {
      id: `PRESET_${Date.now()}`,
      name: name.toUpperCase(),
      settings: { ...filters }
    };

    const updated = [...customPresets, newPreset];
    setCustomPresets(updated);
    try {
      localStorage.setItem('frameflow_user_presets', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeletePreset = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = customPresets.filter(p => p.id !== id);
    setCustomPresets(updated);
    try {
      localStorage.setItem('frameflow_user_presets', JSON.stringify(updated));
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateFrameInBuffer = () => {
    if (!canvasRef.current || !selectedFrame) return;
    
    setIsProcessing(true);
    setTimeout(() => {
      const dataUrl = canvasRef.current!.toDataURL('image/webp', 0.95);
      onUpdateFrame({
        ...selectedFrame,
        dataUrl,
        isAiEnhanced: true,
        fileName: `EDIT_${selectedFrame.fileName}`
      });
      setIsProcessing(false);
      alert("Frame successfully updated in buffer!");
    }, 300);
  };

  const handleDownload = (format: 'image/jpeg' | 'image/png' | 'image/webp') => {
    if (!canvasRef.current || !selectedFrame) return;
    const extension = format === 'image/png' ? 'png' : format === 'image/webp' ? 'webp' : 'jpg';
    const link = document.createElement('a');
    link.download = `STUDIO_PRO_${selectedFrame.fileName.split('.')[0]}.${extension}`;
    link.href = canvasRef.current.toDataURL(format, 0.98);
    link.click();
  };

  const handleRemoveBackground = () => {
    if (!canvasRef.current || !selectedFrame) return;
    
    setIsProcessing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setTimeout(() => {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      const bgR = data[0];
      const bgG = data[1];
      const bgB = data[2];
      const threshold = 40;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        const dist = Math.sqrt(
          Math.pow(r - bgR, 2) + 
          Math.pow(g - bgG, 2) + 
          Math.pow(b - bgB, 2)
        );

        if (dist < threshold) {
          data[i + 3] = 0; // Alpha transparent
        }
      }

      ctx.putImageData(imageData, 0, 0);
      setFilters(prev => ({ ...prev, isCutout: true }));
      setIsProcessing(false);
    }, 600);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans select-none overflow-hidden animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={onClose} />
      
      {/* Studio Frame Window */}
      <div className="relative w-full max-w-6xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200 flex flex-col max-h-[94vh]">
        
        {/* Title Bar */}
        <div className="bg-slate-900 text-white px-5 py-3 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-zinc-800 text-zinc-300 border border-zinc-700 shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm">Advanced Photo & Retouch Studio</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold border bg-zinc-800 text-zinc-300 border-zinc-700">
                  STANDARD EDITION
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Studio Content Deck */}
        <div className="flex flex-1 overflow-hidden">
          
          {/* Left Panel: Frame Selector */}
          <div className="w-52 border-r border-gray-200 flex flex-col bg-slate-50 shrink-0">
            <div className="p-3 border-b border-gray-200 font-bold text-xs text-gray-700 flex justify-between items-center">
              <span>Captured Frames</span>
              <span className="text-[10px] bg-gray-200 text-gray-700 px-1.5 py-0.2 rounded-full font-mono">{frames.length}</span>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
              {frames.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-4 text-gray-400">
                  <Layers className="w-8 h-8 mb-2 opacity-50" />
                  <span className="text-xs font-bold">No Frames in Buffer</span>
                </div>
              ) : (
                frames.map(frame => (
                  <div 
                    key={frame.id}
                    onClick={() => setSelectedFrameId(frame.id)}
                    className={`p-1.5 rounded-xl border cursor-pointer transition-all ${
                      (selectedFrameId === frame.id || (!selectedFrameId && frames[0]?.id === frame.id))
                        ? 'bg-zinc-100 border-zinc-900 shadow-xs' 
                        : 'border-transparent hover:bg-white hover:border-gray-200'
                    }`}
                  >
                    <div className="aspect-video bg-black rounded-lg overflow-hidden">
                      <img src={frame.dataUrl} className="w-full h-full object-cover" alt="Captured" />
                    </div>
                    <div className="text-[11px] truncate mt-1 font-semibold text-gray-800 px-1">
                      {frame.fileName}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Center: Stage Canvas & Interactive View */}
          <div className="flex-1 bg-slate-950 flex flex-col p-4 overflow-hidden relative" ref={containerRef}>
            
            {/* Top Canvas Toolbar */}
            <div className="flex items-center justify-between bg-slate-900/80 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-white/10 mb-3 text-white text-xs">
              <div className="flex items-center gap-3">
                <span className="font-mono text-zinc-300 font-bold text-[11px] truncate max-w-[200px]">
                  {selectedFrame?.fileName || 'NO_FRAME_LOADED'}
                </span>
                {filters.aspectRatio !== 'free' && (
                  <span className="text-[10px] bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded-md font-bold border border-zinc-700">
                    Ratio: {filters.aspectRatio}
                  </span>
                )}
              </div>

              {/* View & Split Comparison Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowSplitView(!showSplitView)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                    showSplitView ? 'bg-zinc-100 text-zinc-900 shadow-xs' : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                  title="Compare Original vs Edited"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>{showSplitView ? 'Hide Split View' : 'Split Compare'}</span>
                </button>

                <div className="flex items-center bg-white/10 rounded-lg p-0.5">
                  <button 
                    onClick={() => setZoomLevel(1)} 
                    className={`px-2 py-0.5 text-[10px] font-bold rounded ${zoomLevel === 1 ? 'bg-white/20 text-white' : 'text-gray-400'}`}
                  >
                    Fit
                  </button>
                  <button 
                    onClick={() => setZoomLevel(1.5)} 
                    className={`px-2 py-0.5 text-[10px] font-bold rounded ${zoomLevel === 1.5 ? 'bg-white/20 text-white' : 'text-gray-400'}`}
                  >
                    150%
                  </button>
                </div>
              </div>
            </div>

            {/* Stage Canvas Area */}
            {selectedFrame ? (
              <div className="flex-1 flex items-center justify-center overflow-hidden relative">
                <div 
                  className="relative shadow-2xl bg-black rounded-xl overflow-hidden max-w-full max-h-full border border-white/10 transition-transform duration-150"
                  style={{ transform: `scale(${zoomLevel})` }}
                >
                  <canvas 
                    ref={canvasRef}
                    className="max-w-full max-h-[58vh] object-contain block"
                  />

                  {/* Split Screen Before / After Comparison Overlay */}
                  {showSplitView && (
                    <div 
                      className="absolute inset-0 pointer-events-none overflow-hidden"
                      style={{ width: `${splitPos}%` }}
                    >
                      <img 
                        src={selectedFrame.dataUrl} 
                        className="max-w-none h-full object-contain absolute left-0 top-0"
                        style={{ width: canvasRef.current?.width || '100%' }}
                        alt="Original" 
                      />
                      <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/80 backdrop-blur-xs text-white rounded text-[10px] font-extrabold">
                        ORIGINAL (BEFORE)
                      </div>
                    </div>
                  )}

                  {showSplitView && (
                    <div 
                      className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize shadow-2xl z-30"
                      style={{ left: `${splitPos}%` }}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        isDraggingSplit.current = true;
                        const onMove = (ev: MouseEvent) => {
                          if (!isDraggingSplit.current || !containerRef.current) return;
                          const rect = containerRef.current.getBoundingClientRect();
                          const pos = Math.max(5, Math.min(95, ((ev.clientX - rect.left) / rect.width) * 100));
                          setSplitPos(pos);
                        };
                        const onUp = () => {
                          isDraggingSplit.current = false;
                          window.removeEventListener('mousemove', onMove);
                          window.removeEventListener('mouseup', onUp);
                        };
                        window.addEventListener('mousemove', onMove);
                        window.addEventListener('mouseup', onUp);
                      }}
                    >
                      <div className="absolute top-1/2 -translate-y-1/2 -left-3 w-7 h-7 bg-white rounded-full shadow-lg flex items-center justify-center text-slate-900 pointer-events-auto">
                        <SlidersHorizontal className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  )}

                  {isProcessing && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-40">
                      <div className="bg-white rounded-xl p-4 flex flex-col items-center gap-2 shadow-2xl">
                        <Zap className="w-6 h-6 text-zinc-900 animate-pulse" />
                        <span className="text-xs font-bold text-gray-800">Processing Photo Matrix...</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-white/40">
                <ImageIcon className="w-12 h-12 mb-3 opacity-30" />
                <span className="text-xs font-bold">Select a frame to edit</span>
              </div>
            )}

            {/* Bottom Export Bar */}
            {selectedFrame && (
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 bg-slate-900/80 backdrop-blur-xs p-2 rounded-xl border border-white/10">
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 text-xs font-bold ml-1">Export Format:</span>
                  <button 
                    onClick={() => handleDownload('image/jpeg')}
                    className="h-8 px-3 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-bold transition-all active:scale-95"
                  >
                    JPG (98%)
                  </button>
                  <button 
                    onClick={() => handleDownload('image/png')}
                    className="h-8 px-3 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-bold transition-all active:scale-95"
                  >
                    Lossless PNG
                  </button>
                  <button 
                    onClick={() => handleDownload('image/webp')}
                    className="h-8 px-3 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-bold transition-all active:scale-95"
                  >
                    WebP HD
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={handleUpdateFrameInBuffer}
                    className="h-8 px-4 bg-white hover:bg-gray-100 text-gray-900 rounded-lg flex items-center gap-1.5 active:scale-95 transition-all font-bold text-xs shadow-xs"
                  >
                    <Check className="w-3.5 h-3.5 text-zinc-900" />
                    <span>Save to Buffer</span>
                  </button>
                  <button 
                    onClick={() => handleDownload('image/jpeg')}
                    className="h-8 px-4 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg flex items-center gap-1.5 active:scale-95 transition-all font-bold text-xs shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Photo</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Panel: Advanced Studio Toolset */}
          <div className="w-80 border-l border-gray-200 flex flex-col bg-white overflow-hidden shrink-0">
            
            {/* Studio Navigation Tabs */}
            <div className="grid grid-cols-4 gap-1 p-2 bg-slate-100 border-b border-gray-200 text-[11px] font-bold text-gray-600">
              <button
                onClick={() => setActiveTab('luts')}
                className={`py-1.5 rounded-lg transition-all ${
                  activeTab === 'luts' ? 'bg-white text-zinc-900 shadow-xs' : 'hover:text-gray-900'
                }`}
              >
                LUTs
              </button>
              <button
                onClick={() => setActiveTab('tone')}
                className={`py-1.5 rounded-lg transition-all ${
                  activeTab === 'tone' ? 'bg-white text-zinc-900 shadow-xs' : 'hover:text-gray-900'
                }`}
              >
                Tone & Light
              </button>
              <button
                onClick={() => setActiveTab('color')}
                className={`py-1.5 rounded-lg transition-all ${
                  activeTab === 'color' ? 'bg-white text-zinc-900 shadow-xs' : 'hover:text-gray-900'
                }`}
              >
                Color
              </button>
              <button
                onClick={() => setActiveTab('effects')}
                className={`py-1.5 rounded-lg transition-all ${
                  activeTab === 'effects' ? 'bg-white text-zinc-900 shadow-xs' : 'hover:text-gray-900'
                }`}
              >
                Effects
              </button>
              <button
                onClick={() => setActiveTab('ai_retouch')}
                className={`py-1.5 rounded-lg transition-all ${
                  activeTab === 'ai_retouch' ? 'bg-white text-zinc-900 shadow-xs' : 'hover:text-gray-900'
                }`}
              >
                Retouch
              </button>
              <button
                onClick={() => setActiveTab('crop')}
                className={`py-1.5 rounded-lg transition-all ${
                  activeTab === 'crop' ? 'bg-white text-zinc-900 shadow-xs' : 'hover:text-gray-900'
                }`}
              >
                Crop / Ratio
              </button>
              <button
                onClick={() => setActiveTab('branding')}
                className={`py-1.5 rounded-lg transition-all col-span-2 ${
                  activeTab === 'branding' ? 'bg-white text-zinc-900 shadow-xs' : 'hover:text-gray-900'
                }`}
              >
                Text & Watermark
              </button>
            </div>

            {/* Tool Options Container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              
              {/* TAB 1: LUTs & Presets */}
              {activeTab === 'luts' && (
                <div className="space-y-3.5">
                  <div className="text-xs font-bold text-gray-800 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-zinc-700" />
                      <span>Studio & Color Presets</span>
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    {GLAMOUR_LUTS.map(lut => (
                      <button
                        key={lut.id}
                        onClick={() => applyLut(lut)}
                        className={`w-full p-2.5 rounded-xl border text-left text-xs font-bold transition-all flex items-center justify-between ${
                          filters.lut === lut.id
                            ? 'bg-zinc-100 border-zinc-900 text-zinc-900 shadow-xs'
                            : 'bg-gray-50/70 border-gray-200 hover:bg-gray-100 text-gray-800'
                        }`}
                      >
                        <span>{lut.label}</span>
                        {filters.lut === lut.id ? (
                          <Check className="w-3.5 h-3.5 text-zinc-900" />
                        ) : null}
                      </button>
                    ))}
                  </div>

                  {/* Custom User Presets Section */}
                  <div className="pt-3 border-t border-gray-100 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-700">Custom User Presets</span>
                      <button
                        onClick={handleSaveCustomPreset}
                        className="px-2 py-0.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 border border-zinc-300 rounded text-[10px] font-bold flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Save Current</span>
                      </button>
                    </div>

                    {customPresets.length === 0 ? (
                      <p className="text-[11px] text-gray-400 italic">No saved user presets yet.</p>
                    ) : (
                      <div className="space-y-1">
                        {customPresets.map(preset => (
                          <div 
                            key={preset.id}
                            onClick={() => setFilters({ ...preset.settings })}
                            className="p-2 bg-slate-50 hover:bg-zinc-100 rounded-lg border border-gray-200 text-xs font-bold flex justify-between items-center cursor-pointer text-gray-800"
                          >
                            <span>⭐ {preset.name}</span>
                            <button
                              onClick={(e) => handleDeletePreset(preset.id, e)}
                              className="text-gray-400 hover:text-red-600 p-1"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Reset to Default */}
                  <button
                    onClick={() => setFilters(DEFAULT_FILTERS)}
                    className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Undo className="w-3.5 h-3.5" />
                    <span>Reset All Adjustments</span>
                  </button>
                </div>
              )}

              {/* TAB 2: Tone & Light */}
              {activeTab === 'tone' && (
                <div className="space-y-3.5">
                  <div className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                    <Sun className="w-3.5 h-3.5 text-zinc-700" />
                    <span>Light & Tone Curve Calibration</span>
                  </div>

                  {[
                    { label: 'Exposure / Brightness', key: 'exposure', min: 50, max: 180, pro: false },
                    { label: 'Contrast', key: 'contrast', min: 50, max: 180, pro: false },
                    { label: 'Highlights Recovery', key: 'highlights', min: -50, max: 50, pro: false },
                    { label: 'Shadows Lift', key: 'shadows', min: -50, max: 50, pro: false },
                    { label: 'Whites Balance', key: 'whites', min: -50, max: 50, pro: false },
                    { label: 'Blacks Depth', key: 'blacks', min: -50, max: 50, pro: false }
                  ].map(slider => (
                    <div key={slider.key} className="space-y-1">
                      <div className="flex justify-between text-xs font-bold text-gray-700">
                        <span className="flex items-center gap-1">
                          {slider.label}
                        </span>
                        <span className="font-mono text-zinc-900">{(filters as any)[slider.key]}</span>
                      </div>
                      <input 
                        type="range"
                        min={slider.min}
                        max={slider.max}
                        value={(filters as any)[slider.key]}
                        onChange={(e) => {
                          setFilters(prev => ({ ...prev, [slider.key]: parseInt(e.target.value), lut: null }));
                        }}
                        className="w-full h-3 appearance-none bg-gray-100 rounded-lg cursor-pointer accent-zinc-900"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* TAB 3: Color & HSL */}
              {activeTab === 'color' && (
                <div className="space-y-3.5">
                  <div className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5 text-zinc-700" />
                    <span>Color Temperature & HSL</span>
                  </div>

                  {[
                    { label: 'Color Saturation', key: 'saturation', min: 0, max: 200, pro: false },
                    { label: 'Temperature (Kelvin)', key: 'warmth', min: -50, max: 50, pro: false },
                    { label: 'Tint (Green / Magenta)', key: 'tint', min: -50, max: 50, pro: false },
                    { label: 'Hue Rotate', key: 'hue', min: -180, max: 180, pro: false }
                  ].map(slider => (
                    <div key={slider.key} className="space-y-1">
                      <div className="flex justify-between text-xs font-bold text-gray-700">
                        <span className="flex items-center gap-1">
                          {slider.label}
                        </span>
                        <span className="font-mono text-zinc-900">{(filters as any)[slider.key]}</span>
                      </div>
                      <input 
                        type="range"
                        min={slider.min}
                        max={slider.max}
                        value={(filters as any)[slider.key]}
                        onChange={(e) => {
                          setFilters(prev => ({ ...prev, [slider.key]: parseInt(e.target.value), lut: null }));
                        }}
                        className="w-full h-3 appearance-none bg-gray-100 rounded-lg cursor-pointer accent-zinc-900"
                      />
                    </div>
                  ))}

                  <div className="pt-2 border-t border-gray-100 grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setFilters(prev => ({ ...prev, grayscale: !prev.grayscale }))}
                      className={`p-2 rounded-lg border text-xs font-bold transition-all ${
                        filters.grayscale ? 'bg-zinc-900 text-white' : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      B&W Monochrome
                    </button>
                    <button
                      onClick={() => setFilters(prev => ({ ...prev, sepia: !prev.sepia }))}
                      className={`p-2 rounded-lg border text-xs font-bold transition-all ${
                        filters.sepia ? 'bg-zinc-900 text-white' : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      Vintage Sepia
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 4: Effects & Grain */}
              {activeTab === 'effects' && (
                <div className="space-y-3.5">
                  <div className="text-xs font-bold text-gray-800 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5 text-zinc-700" />
                      <span>Detail, Grain & Vignette</span>
                    </span>
                  </div>

                  {[
                    { label: '35mm Film Grain', key: 'filmGrain', min: 0, max: 50 },
                    { label: 'Edge Vignette Amount', key: 'vignetteAmount', min: 0, max: 80 },
                    { label: 'Atmospheric Glow', key: 'glow', min: 0, max: 50 }
                  ].map(slider => (
                    <div key={slider.key} className="space-y-1">
                      <div className="flex justify-between text-xs font-bold text-gray-700">
                        <span className="flex items-center gap-1">
                          {slider.label}
                        </span>
                        <span className="font-mono text-zinc-900">{(filters as any)[slider.key]}</span>
                      </div>
                      <input 
                        type="range"
                        min={slider.min}
                        max={slider.max}
                        value={(filters as any)[slider.key]}
                        onChange={(e) => {
                          setFilters(prev => ({ ...prev, [slider.key]: parseInt(e.target.value) }));
                        }}
                        className="w-full h-3 appearance-none bg-gray-100 rounded-lg cursor-pointer accent-zinc-900"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* TAB 5: Retouch & Blur */}
              {activeTab === 'ai_retouch' && (
                <div className="space-y-4">
                  <div className="text-xs font-bold text-gray-800 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-zinc-700" />
                      <span>Portrait Retouch & Blur</span>
                    </span>
                  </div>

                  {/* Skin Smoothing Slider */}
                  <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl space-y-2">
                    <div className="flex justify-between text-xs font-bold text-zinc-900">
                      <span className="flex items-center gap-1">
                        Portrait Skin Smoothing
                      </span>
                      <span className="font-mono text-zinc-900">{filters.skinSmooth}%</span>
                    </div>
                    <p className="text-[10px] text-zinc-600 leading-tight">
                      Softens skin texture and reduces blemishes while keeping edges sharp.
                    </p>
                    <input 
                      type="range"
                      min="0"
                      max="100"
                      value={filters.skinSmooth}
                      onChange={(e) => {
                        setFilters(prev => ({ ...prev, skinSmooth: parseInt(e.target.value) }));
                      }}
                      className="w-full h-3 appearance-none bg-zinc-200 rounded-lg cursor-pointer accent-zinc-900"
                    />
                  </div>

                  {/* Bokeh Background Blur */}
                  <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl space-y-2">
                    <div className="flex justify-between text-xs font-bold text-zinc-900">
                      <span className="flex items-center gap-1">
                        Depth of Field Blur
                      </span>
                      <span className="font-mono text-zinc-900">{filters.bokehBlur}%</span>
                    </div>
                    <p className="text-[10px] text-zinc-600 leading-tight">
                      Simulates shallow depth-of-field lens blur with center subject focus.
                    </p>
                    <input 
                      type="range"
                      min="0"
                      max="100"
                      value={filters.bokehBlur}
                      onChange={(e) => {
                        setFilters(prev => ({ ...prev, bokehBlur: parseInt(e.target.value) }));
                      }}
                      className="w-full h-3 appearance-none bg-zinc-200 rounded-lg cursor-pointer accent-zinc-900"
                    />
                  </div>

                  {/* Background Cutout Matting */}
                  <div className="space-y-1.5">
                    <button
                      onClick={handleRemoveBackground}
                      className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl flex items-center justify-center gap-2 font-bold text-xs shadow-xs active:scale-95 transition-all"
                    >
                      <Wind className="w-4 h-4" />
                      <span>Cutout & Remove Background</span>
                    </button>
                    <span className="text-[10px] text-gray-500 block text-center">
                      Exports with transparent alpha for stickers & graphics.
                    </span>
                  </div>

                </div>
              )}

              {/* TAB 6: Crop & Aspect Ratio */}
              {activeTab === 'crop' && (
                <div className="space-y-3.5">
                  <div className="text-xs font-bold text-gray-800 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Crop className="w-3.5 h-3.5 text-zinc-700" />
                      <span>Social Aspect Ratios & Transform</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: 'free', label: 'Freeform' },
                      { id: '1:1', label: '1:1 Square' },
                      { id: '9:16', label: '9:16 Vertical' },
                      { id: '16:9', label: '16:9 Landscape' },
                      { id: '4:5', label: '4:5 Portrait' },
                      { id: '21:9', label: '21:9 Cinema' }
                    ].map(ratio => (
                      <button
                        key={ratio.id}
                        onClick={() => setFilters(prev => ({ ...prev, aspectRatio: ratio.id as any }))}
                        className={`p-2 rounded-xl border text-[11px] font-bold text-center transition-all ${
                          filters.aspectRatio === ratio.id 
                            ? 'bg-zinc-900 text-white shadow-xs' 
                            : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200'
                        }`}
                      >
                        {ratio.label}
                      </button>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-gray-100 space-y-2">
                    <span className="text-xs font-bold text-gray-700 block">Rotate & Flip</span>
                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        onClick={() => setFilters(prev => ({ ...prev, rotation: (prev.rotation + 90) % 360 }))}
                        className="py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-bold flex items-center justify-center gap-1"
                      >
                        <RotateCw className="w-3 h-3" />
                        <span>Rotate 90°</span>
                      </button>
                      <button
                        onClick={() => setFilters(prev => ({ ...prev, flipH: !prev.flipH }))}
                        className={`py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 ${
                          filters.flipH ? 'bg-zinc-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <FlipHorizontal className="w-3 h-3" />
                        <span>Flip H</span>
                      </button>
                      <button
                        onClick={() => setFilters(prev => ({ ...prev, flipV: !prev.flipV }))}
                        className={`py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 ${
                          filters.flipV ? 'bg-zinc-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <FlipVertical className="w-3 h-3" />
                        <span>Flip V</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 7: Creator Text & Watermark */}
              {activeTab === 'branding' && (
                <div className="space-y-3.5">
                  <div className="text-xs font-bold text-gray-800 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Type className="w-3.5 h-3.5 text-zinc-700" />
                      <span>Text Branding & Badge</span>
                    </span>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">Custom Watermark Text:</label>
                    <input 
                      type="text"
                      placeholder="@handle or title"
                      value={filters.watermarkText}
                      onChange={(e) => {
                        setFilters(prev => ({ ...prev, watermarkText: e.target.value }));
                      }}
                      className="w-full h-8 px-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-zinc-400 focus:outline-none"
                    />
                  </div>

                  {/* Creator Badges */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700">Add Creator Badge:</label>
                    <div className="flex flex-wrap gap-1.5">
                      {CREATOR_BADGES.map(badge => (
                        <button
                          key={badge}
                          onClick={() => {
                            setFilters(prev => ({
                              ...prev,
                              watermarkBadge: prev.watermarkBadge === badge ? null : badge
                            }));
                          }}
                          className={`px-2 py-1 rounded-lg text-[10px] font-extrabold transition-all border ${
                            filters.watermarkBadge === badge 
                              ? 'bg-zinc-900 text-white border-zinc-900 shadow-xs' 
                              : 'bg-zinc-100 text-zinc-800 border-zinc-200 hover:bg-zinc-200'
                          }`}
                        >
                          {badge}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Position selector */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">Position Placement:</label>
                    <div className="grid grid-cols-3 gap-1">
                      {[
                        { id: 'top-left', label: 'Top Left' },
                        { id: 'top-right', label: 'Top Right' },
                        { id: 'center', label: 'Center' },
                        { id: 'bottom-left', label: 'Bottom Left' },
                        { id: 'bottom-right', label: 'Bottom Right' }
                      ].map(pos => (
                        <button
                          key={pos.id}
                          onClick={() => setFilters(prev => ({ ...prev, watermarkPosition: pos.id as any }))}
                          className={`p-1.5 rounded-lg text-[10px] font-bold border transition-all ${
                            filters.watermarkPosition === pos.id 
                              ? 'bg-zinc-900 text-white border-zinc-900' 
                              : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {pos.label}
                        </button>
                      ))}
                    </div>
                  </div>

                </div>
              )}

            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default ImageEditorModal;

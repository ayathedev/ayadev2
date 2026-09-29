import React, { useState } from 'react';
import { 
  X, 
  Sliders, 
  FolderDown, 
  ArrowRight, 
  Bookmark, 
  Crown, 
  ShieldCheck, 
  Sparkles, 
  Camera, 
  Lock,
  Layers
} from 'lucide-react';
import { ExportSettings } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ExportSettings;
  onSettingsChange: (settings: ExportSettings) => void;
  onBulkExport: (fps: number) => void;
  isPro: boolean;
  onUpgradeClick: () => void;
}

const PRESETS = [
  { 
    id: 'SOCIAL_HD', 
    label: '📱 SOCIAL MEDIA OPTIMIZED (1080P / JPG)', 
    pro: false,
    settings: { format: 'image/jpeg', quality: 0.95, scale: 1.0 } 
  },
  { 
    id: 'WEB_SPEED', 
    label: '⚡ FAST PREVIEW / WEBP (720P)', 
    pro: false,
    settings: { format: 'image/webp', quality: 0.8, scale: 0.75 } 
  },
  { 
    id: 'STANDARD_PNG', 
    label: '🖼️ LOSSLESS MASTER (1080P / PNG)', 
    pro: false,
    settings: { format: 'image/png', quality: 1.0, scale: 1.0 } 
  }
];

export const SettingsModal: React.FC<SettingsModalProps> = ({ 
  isOpen, 
  onClose, 
  settings, 
  onSettingsChange, 
  onBulkExport,
  isPro,
  onUpgradeClick
}) => {
  const [bulkFps, setBulkFps] = useState(24);

  if (!isOpen) return null;

  const handlePresetChange = (presetId: string) => {
    const preset = PRESETS.find(p => p.id === presetId);
    if (preset) {
      onSettingsChange({
        ...settings,
        ...preset.settings as any
      });
    }
  };

  const handleScaleChange = (newScale: number) => {
    onSettingsChange({ ...settings, scale: newScale });
  };

  const watermarkConfig = settings.watermarkConfig || {
    enabled: !!settings.watermarkText,
    text: settings.watermarkText || '',
    position: 'bottom-right',
    opacity: 0.8,
    fontSize: 16,
    color: '#ffffff',
    removeDefaultWatermark: isPro
  };

  const updateWatermark = (updates: Partial<typeof watermarkConfig>) => {
    const updated = { ...watermarkConfig, ...updates };
    onSettingsChange({
      ...settings,
      watermarkText: updated.text,
      watermarkConfig: updated
    });
  };

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs font-sans select-none animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={onClose} />
      
      {/* Window Panel */}
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Title Bar */}
        <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-zinc-400" />
            <span className="font-bold text-sm">Studio Preferences & Export Configuration</span>
          </div>
          <button 
            onClick={onClose} 
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-5 overflow-y-auto flex-1 bg-slate-50/50">
          
          {/* Presets Group */}
          <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                <Bookmark className="w-3.5 h-3.5 text-zinc-700" />
                <span>Export Presets</span>
              </span>
            </div>
            <select 
              onChange={(e) => handlePresetChange(e.target.value)}
              className="w-full h-8 bg-gray-50 border border-gray-200 rounded-lg px-2.5 text-xs font-bold text-gray-800 focus:bg-white focus:ring-2 focus:ring-zinc-400 focus:outline-none cursor-pointer"
              defaultValue=""
            >
              <option value="" disabled>CHOOSE A PRESET...</option>
              {PRESETS.map(p => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          {/* Resolution & Scale */}
          <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-xs space-y-3">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-gray-800 flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-zinc-700" />
                <span>Capture Resolution Scale</span>
              </span>
              <span className="text-zinc-800 font-mono">
                {settings.scale.toFixed(2)}x Native
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: '0.75x (720p HD)', val: 0.75 },
                { label: '1.0x (1080p Full HD)', val: 1.0 }
              ].map(item => (
                <button
                  key={item.val}
                  onClick={() => handleScaleChange(item.val)}
                  className={`py-2 rounded-lg text-xs font-bold transition-all relative flex flex-col items-center justify-center ${
                    settings.scale === item.val
                      ? 'bg-zinc-900 text-white shadow-xs'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Format & Quality */}
          <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-xs space-y-3">
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-gray-800">Output Image Format</span>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { fmt: 'image/png', label: 'PNG (Lossless)' },
                  { fmt: 'image/jpeg', label: 'JPEG (Photo)' },
                  { fmt: 'image/webp', label: 'WebP (Small File)' }
                ].map(item => (
                  <button
                    key={item.fmt}
                    onClick={() => onSettingsChange({ ...settings, format: item.fmt as any })}
                    className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                      settings.format === item.fmt 
                        ? 'bg-zinc-900 text-white shadow-xs' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-gray-700">Encoding Quality:</span>
                <span className="text-zinc-800 font-mono">{Math.round(settings.quality * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.4"
                max="1.0"
                step="0.05"
                value={settings.quality}
                onChange={(e) => onSettingsChange({ ...settings, quality: parseFloat(e.target.value) })}
                className="w-full h-4 appearance-none bg-gray-100 border border-gray-200 rounded-lg cursor-pointer accent-zinc-900"
              />
            </div>
          </div>

          {/* Custom Watermark & Brand Protection */}
          <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-zinc-700" />
                <span>Custom Watermark & Creator Handle</span>
              </span>
              <span className="text-[10px] font-extrabold bg-zinc-100 text-zinc-700 border border-zinc-200 px-1.5 py-0.5 rounded">
                WATERMARKING
              </span>
            </div>

            <div className="space-y-2">
              <div>
                <label className="text-[11px] font-bold text-gray-600 mb-1 block">
                  Brand Name / Social Handle (e.g. @YourName or YourBrand):
                </label>
                <input 
                  type="text"
                  value={watermarkConfig.text}
                  placeholder="e.g. @ModelHandle • onlyfans.com/..."
                  onChange={(e) => updateWatermark({ text: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-zinc-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <label className="text-[11px] font-bold text-gray-600 mb-1 block">Position:</label>
                  <select
                    value={watermarkConfig.position}
                    onChange={(e) => updateWatermark({ position: e.target.value as any })}
                    className="w-full h-7 bg-gray-50 border border-gray-200 rounded-lg px-2 text-xs font-bold"
                  >
                    <option value="bottom-right">Bottom Right (Classic)</option>
                    <option value="bottom-left">Bottom Left</option>
                    <option value="top-right">Top Right</option>
                    <option value="top-left">Top Left</option>
                    <option value="center">Center Stamp</option>
                  </select>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] font-bold text-gray-600 mb-1">
                    <span>Opacity:</span>
                    <span>{Math.round(watermarkConfig.opacity * 100)}%</span>
                  </div>
                  <input 
                    type="range"
                    min="0.2"
                    max="1.0"
                    step="0.1"
                    value={watermarkConfig.opacity}
                    onChange={(e) => updateWatermark({ opacity: parseFloat(e.target.value) })}
                    className="w-full h-4 appearance-none bg-gray-100 rounded cursor-pointer accent-zinc-900"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sequence Auto Snap */}
          <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-800">Auto-Snap Sequence Interval</span>
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox"
                  checked={settings.autoCaptureEnabled}
                  onChange={() => onSettingsChange({ ...settings, autoCaptureEnabled: !settings.autoCaptureEnabled })}
                  className="w-4 h-4 rounded text-zinc-900 accent-zinc-900 cursor-pointer"
                />
                <span className="text-xs font-bold text-gray-700">Enabled</span>
              </label>
            </div>

            {settings.autoCaptureEnabled && (
              <div className="pt-2 border-t border-gray-100 space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-gray-600">Snap Interval:</span>
                  <span className="text-zinc-800 font-mono">Every {settings.autoCaptureInterval} seconds</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="15"
                  step="0.5"
                  value={settings.autoCaptureInterval}
                  onChange={(e) => onSettingsChange({ ...settings, autoCaptureInterval: parseFloat(e.target.value) })}
                  className="w-full h-4 appearance-none bg-gray-100 border border-gray-200 rounded-lg cursor-pointer accent-zinc-900"
                />
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-gray-200 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl active:scale-95 transition-all shadow-sm"
          >
            Save & Close
          </button>
        </div>

      </div>
    </div>
  );
};

export default SettingsModal;

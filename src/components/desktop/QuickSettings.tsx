import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Wifi, 
  Volume2, 
  VolumeX, 
  Settings, 
  Sun, 
  HelpCircle, 
  RotateCcw,
  Sparkles,
  Info
} from 'lucide-react';
import { playUiSound } from '../../utils/soundEffects';

interface QuickSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  activeWallpaperId: string;
  setWallpaper: (id: string) => void;
  openSettingsApp: () => void;
  rerunSetupWizard?: () => void;
}

export const QuickSettings: React.FC<QuickSettingsProps> = ({
  isOpen,
  onClose,
  soundEnabled,
  setSoundEnabled,
  openSettingsApp,
  rerunSetupWizard,
}) => {
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[80]" onClick={onClose}>
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.15 }}
          onClick={(e) => e.stopPropagation()}
          className="absolute bottom-16 right-4 w-80 bg-slate-900/95 border border-slate-700/80 rounded-2xl shadow-2xl p-4 text-slate-100 backdrop-blur-xl space-y-4"
        >
          {/* Header Row */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-100">Aya OS Portfolio Edition</h3>
              <p className="text-[11px] text-slate-400">Created by Aya Kalimah Satya Ruane</p>
            </div>
            <button
              onClick={() => {
                openSettingsApp();
                onClose();
              }}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 transition-colors"
              title="Open Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Controls Grid */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            {/* Wifi Hotspot status */}
            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center gap-2.5">
              <Wifi className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <strong className="block text-slate-200 font-semibold text-[11px]">Local Hotspot</strong>
                <span className="text-[10px] text-slate-400 font-mono">192.168.4.1</span>
              </div>
            </div>

            {/* Audio Toggle */}
            <button
              onClick={() => {
                const nextState = !soundEnabled;
                setSoundEnabled(nextState);
                playUiSound('click', nextState);
              }}
              className={`p-3 rounded-xl border flex items-center gap-2.5 text-left transition-all ${
                soundEnabled
                  ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                  : 'bg-slate-800/60 border-slate-700/60 text-slate-400'
              }`}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              <div>
                <strong className="block text-[11px] font-semibold">UI Audio</strong>
                <span className="text-[10px] text-slate-400">{soundEnabled ? 'Enabled' : 'Muted'}</span>
              </div>
            </button>
          </div>

          {/* Re-run Tour Button */}
          {rerunSetupWizard && (
            <button
              onClick={() => {
                playUiSound('click', soundEnabled);
                rerunSetupWizard();
                onClose();
              }}
              className="w-full p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 flex items-center justify-between text-xs text-slate-200 transition-colors"
            >
              <span className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-cyan-400" /> Setup Wizard Tour
              </span>
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            </button>
          )}

          {/* Footer Info */}
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1 text-slate-300 font-medium">
              <Sparkles className="w-3 h-3 text-amber-400" /> Node Status: Active
            </span>
            <span className="font-mono text-cyan-300 font-bold">{timeStr}</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

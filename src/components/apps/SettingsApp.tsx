import React, { useState } from 'react';
import { WALLPAPERS } from '../../data/wallpapers';
import { APPS_METADATA } from '../../data/portfolioData';
import { playUiSound } from '../../utils/soundEffects';
import { 
  Settings, 
  Image as ImageIcon, 
  Volume2, 
  VolumeX, 
  Info, 
  Wifi, 
  User, 
  ShieldCheck, 
  Cpu, 
  RotateCcw,
  Sparkles,
  CheckCircle2,
  Terminal,
  Folder,
  Palette,
  Music,
  Gamepad2,
  FileText
} from 'lucide-react';

interface SettingsAppProps {
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  activeWallpaperId: string;
  setWallpaper: (id: string) => void;
  rerunSetupWizard?: () => void;
}

export const SettingsApp: React.FC<SettingsAppProps> = ({
  soundEnabled,
  setSoundEnabled,
  activeWallpaperId,
  setWallpaper,
  rerunSetupWizard,
}) => {
  const [activeTab, setActiveTab] = useState<'about' | 'appearance' | 'sound' | 'network'>('about');

  return (
    <div className="h-full w-full bg-slate-900 text-slate-100 flex flex-col md:flex-row overflow-hidden select-none">
      {/* Settings Navigation Sidebar */}
      <div className="w-full md:w-60 bg-slate-950/80 border-b md:border-b-0 md:border-r border-slate-800 p-3 flex md:flex-col gap-1 overflow-x-auto shrink-0">
        <div className="hidden md:flex items-center gap-2.5 px-3 py-3 mb-2 border-b border-slate-800/80">
          <Settings className="w-5 h-5 text-cyan-400" />
          <span className="font-bold text-sm text-slate-200">System Settings</span>
        </div>

        <button
          onClick={() => setActiveTab('about')}
          className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all w-full text-left ${
            activeTab === 'about'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Info className="w-4 h-4" /> About & Creator
        </button>

        <button
          onClick={() => setActiveTab('appearance')}
          className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all w-full text-left ${
            activeTab === 'appearance'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <ImageIcon className="w-4 h-4" /> Wallpaper & Display
        </button>

        <button
          onClick={() => setActiveTab('sound')}
          className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all w-full text-left ${
            activeTab === 'sound'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Volume2 className="w-4 h-4" /> Audio & Sound FX
        </button>

        <button
          onClick={() => setActiveTab('network')}
          className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all w-full text-left ${
            activeTab === 'network'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Wifi className="w-4 h-4" /> Hotspot Server Node
        </button>
      </div>

      {/* Main Settings Panel Content */}
      <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-slate-900/60">
        {activeTab === 'about' && (
          <div className="space-y-6 max-w-2xl">
            {/* Header Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 border border-slate-800 shadow-xl flex items-start justify-between">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5" /> Aya OS Portfolio Edition v2.5
                </div>
                <h2 className="text-2xl font-black text-white tracking-tight">Aya OS Portfolio Edition</h2>
                <p className="text-xs text-slate-300 leading-relaxed max-w-md">
                  Created by <strong className="text-cyan-300 font-semibold">Aya Kalimah Satya Ruane</strong>. A custom web operating system designed to run on a local offline web server hotspot.
                </p>
              </div>

              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center text-white font-extrabold text-2xl shadow-lg border border-white/10 shrink-0">
                A
              </div>
            </div>

            {/* Clear Creator Statement Box */}
            <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
                <User className="w-4 h-4" /> Creator & Project Attribution
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                This operating system is created by <strong className="text-white font-semibold">Aya Kalimah Satya Ruane</strong> as an interactive engineering portfolio. The included apps and utilities demonstrate specific software engineering skills and creative projects:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-start gap-2.5">
                  <Terminal className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                  <div>
                    <strong className="text-xs text-slate-200 block font-semibold">Crosh Terminal</strong>
                    <span className="text-[11px] text-slate-400">UNIX shell emulation & neofetch built by Aya</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-start gap-2.5">
                  <Folder className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                  <div>
                    <strong className="text-xs text-slate-200 block font-semibold">Files Manager</strong>
                    <span className="text-[11px] text-slate-400">Custom web file system & code viewer by Aya</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-start gap-2.5">
                  <Palette className="w-4 h-4 text-pink-400 mt-0.5 shrink-0" />
                  <div>
                    <strong className="text-xs text-slate-200 block font-semibold">Canvas Studio</strong>
                    <span className="text-[11px] text-slate-400">Neon graphics & symmetry engine by Aya</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-start gap-2.5">
                  <Music className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                  <div>
                    <strong className="text-xs text-slate-200 block font-semibold">SynthLab Audio</strong>
                    <span className="text-[11px] text-slate-400">16-Step WebAudio synthesizer by Aya</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-start gap-2.5">
                  <Gamepad2 className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
                  <div>
                    <strong className="text-xs text-slate-200 block font-semibold">Space Defense 2D</strong>
                    <span className="text-[11px] text-slate-400">60fps HTML5 Canvas arcade game by Aya</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-start gap-2.5">
                  <FileText className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
                  <div>
                    <strong className="text-xs text-slate-200 block font-semibold">Hotspot Notes</strong>
                    <span className="text-[11px] text-slate-400">Offline persistent logger created by Aya</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Launch Guided Tour Button */}
            {rerunSetupWizard && (
              <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-slate-200">First Time Welcome Tour</h4>
                  <p className="text-[11px] text-slate-400">Re-run the setup wizard introduction to Aya Kalimah Satya Ruane</p>
                </div>
                <button
                  onClick={() => {
                    playUiSound('click', soundEnabled);
                    rerunSetupWizard();
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-cyan-300 border border-slate-700 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Re-run Tour
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'appearance' && (
          <div className="space-y-5 max-w-2xl">
            <div>
              <h3 className="text-base font-bold text-slate-100">Desktop Wallpaper Theme</h3>
              <p className="text-xs text-slate-400">Select a wallpaper for Aya Dev OS. The watermark "Aya Dev OS" remains rendered on the desktop canvas.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {WALLPAPERS.map((wp) => (
                <div
                  key={wp.id}
                  onClick={() => {
                    playUiSound('click', soundEnabled);
                    setWallpaper(wp.id);
                  }}
                  className={`group relative rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${
                    activeWallpaperId === wp.id
                      ? 'border-cyan-400 ring-2 ring-cyan-500/30 scale-[1.02]'
                      : 'border-slate-800 hover:border-slate-600'
                  }`}
                >
                  <div
                    className="h-28 bg-cover bg-center"
                    style={{
                      backgroundImage: wp.url.startsWith('linear-gradient')
                        ? wp.url
                        : `url(${wp.url})`
                    }}
                  />
                  <div className="p-3 bg-slate-950 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-200">{wp.name}</h4>
                      <p className="text-[10px] text-slate-400">{wp.category}</p>
                    </div>
                    {activeWallpaperId === wp.id && (
                      <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'sound' && (
          <div className="space-y-5 max-w-2xl">
            <div>
              <h3 className="text-base font-bold text-slate-100">Audio & Sound FX</h3>
              <p className="text-xs text-slate-400">Synthesized audio triggers generated dynamically using browser WebAudio API.</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {soundEnabled ? (
                  <Volume2 className="w-5 h-5 text-cyan-400" />
                ) : (
                  <VolumeX className="w-5 h-5 text-slate-500" />
                )}
                <div>
                  <h4 className="text-xs font-bold text-slate-200">UI Sound Effects</h4>
                  <p className="text-[11px] text-slate-400">Window management, launcher clicks, and notifications</p>
                </div>
              </div>

              <button
                onClick={() => {
                  const nextState = !soundEnabled;
                  setSoundEnabled(nextState);
                  playUiSound('click', nextState);
                }}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  soundEnabled ? 'bg-cyan-500' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    soundEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        )}

        {activeTab === 'network' && (
          <div className="space-y-5 max-w-2xl">
            <div>
              <h3 className="text-base font-bold text-slate-100">Hotspot Server Node Specs</h3>
              <p className="text-xs text-slate-400">Information about the local server and captive portal routing.</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                <span className="text-slate-400">Local Gateway IP</span>
                <span className="font-mono text-cyan-300">192.168.4.1</span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                <span className="text-slate-400">Captive Endpoint</span>
                <span className="font-mono text-slate-200">/generate_204</span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                <span className="text-slate-400">Mode</span>
                <span className="text-emerald-400 font-semibold">Offline Access Point (No Internet)</span>
              </div>

              <div className="flex justify-between py-1.5">
                <span className="text-slate-400">OS Host</span>
                <span className="text-slate-200 font-medium">Aya OS Portfolio Edition (Aya Kalimah Satya Ruane)</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

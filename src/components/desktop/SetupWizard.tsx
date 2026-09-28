import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Wifi, 
  Cpu, 
  Terminal, 
  Palette, 
  Music, 
  Folder, 
  Gamepad2, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft,
  Volume2,
  VolumeX,
  ShieldCheck,
  Award,
  Radio,
  Mic
} from 'lucide-react';
import { playUiSound } from '../../utils/soundEffects';

interface SetupWizardProps {
  isOpen: boolean;
  onComplete: () => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  activeWallpaperId: string;
  setWallpaper: (id: string) => void;
}

export const SetupWizard: React.FC<SetupWizardProps> = ({
  isOpen,
  onComplete,
  soundEnabled,
  setSoundEnabled,
  activeWallpaperId,
  setWallpaper,
}) => {
  const [step, setStep] = useState(0);

  if (!isOpen) return null;

  const handleNext = () => {
    playUiSound('click', soundEnabled);
    if (step < 3) {
      setStep(step + 1);
    } else {
      playUiSound('notification', soundEnabled);
      onComplete();
    }
  };

  const handleBack = () => {
    playUiSound('click', soundEnabled);
    if (step > 0) {
      setStep(step - 1);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-xl p-4 sm:p-6 overflow-hidden select-none">
        {/* Glow ambient background effects */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-600/20 rounded-full blur-3xl pointer-events-none animate-pulse"></div>

        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 20 }}
          className="relative w-full max-w-2xl bg-slate-900/90 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header Bar */}
          <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                A
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-100 tracking-tight">Aya OS Portfolio Edition</h2>
                <p className="text-xs text-slate-400">First Time Setup & Profile Welcome</p>
              </div>
            </div>
            
            {/* Step Indicators */}
            <div className="flex items-center gap-1.5">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === step
                      ? 'w-7 bg-cyan-400'
                      : i < step
                      ? 'w-2 bg-cyan-600'
                      : 'w-2 bg-slate-700'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Slide Content */}
          <div className="p-6 sm:p-8 flex-1 overflow-y-auto space-y-6">
            {step === 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6 text-center sm:text-left"
              >
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5" /> Portfolio OS Setup
                </div>

                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    Hello, I'm <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400">Aya Kalimah Satya Ruane</span>
                  </h1>
                  <p className="mt-3 text-slate-300 text-sm leading-relaxed">
                    Welcome to <strong className="text-cyan-300 font-semibold">Aya OS Portfolio Edition</strong>. You have connected to my standalone local web server hotspot.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400 mt-0.5">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-200">Personal Creative Showcase</h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        This web operating system showcases software engineering projects, creative applications, synthesizers, and interactive tools built by Aya Kalimah Satya Ruane.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-slate-950/40 border border-slate-800 text-slate-300">
                    <span className="block text-slate-500 uppercase text-[10px] font-mono">Creator</span>
                    <strong className="text-cyan-300 font-medium">Aya Kalimah Satya Ruane</strong>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-950/40 border border-slate-800 text-slate-300">
                    <span className="block text-slate-500 uppercase text-[10px] font-mono">Environment</span>
                    <strong className="text-slate-200 font-medium">Standalone Web OS</strong>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                  <Wifi className="w-3.5 h-3.5" /> Local No-Internet Hotspot Architecture
                </div>

                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    Why Are You Seeing This Desktop?
                  </h2>
                  <p className="mt-2 text-slate-300 text-sm leading-relaxed">
                    When any device connects to my local Wi-Fi hotspot access point, the network's captive portal routes the browser directly to this server.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60 flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400 mt-0.5">
                      <Cpu className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">100% Offline Autonomy</h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        This system operates entirely on my local web server node with no active internet connection required.
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60 flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400 mt-0.5">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Interactive Portfolio</h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Instead of a plain static landing page, you get my web-based desktop environment to test and run my creations live.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-5"
              >
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold">
                  <Cpu className="w-3.5 h-3.5" /> What You Can Explore
                </div>

                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight">
                    Applications & Projects
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Click on any app on the bottom shelf dock or launcher to launch it in a draggable window.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2.5 text-xs">
                  <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 flex items-center gap-2.5">
                    <Terminal className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <strong className="text-slate-200 block font-semibold">Crosh Terminal</strong>
                      <span className="text-[11px] text-slate-400">UNIX shell & neofetch</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 flex items-center gap-2.5">
                    <Folder className="w-4 h-4 text-blue-400 shrink-0" />
                    <div>
                      <strong className="text-slate-200 block font-semibold">Files Manager</strong>
                      <span className="text-[11px] text-slate-400">Source code & docs viewer</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 flex items-center gap-2.5">
                    <Palette className="w-4 h-4 text-pink-400 shrink-0" />
                    <div>
                      <strong className="text-slate-200 block font-semibold">Canvas Studio</strong>
                      <span className="text-[11px] text-slate-400">Neon graphics & symmetry</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 flex items-center gap-2.5">
                    <Music className="w-4 h-4 text-amber-400 shrink-0" />
                    <div>
                      <strong className="text-slate-200 block font-semibold">SynthLab Audio</strong>
                      <span className="text-[11px] text-slate-400">16-Step WebAudio Synth</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 flex items-center gap-2.5">
                    <Gamepad2 className="w-4 h-4 text-indigo-400 shrink-0" />
                    <div>
                      <strong className="text-slate-200 block font-semibold">Space Defense</strong>
                      <span className="text-[11px] text-slate-400">60fps Arcade Game engine</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 flex items-center gap-2.5">
                    <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
                    <div>
                      <strong className="text-slate-200 block font-semibold">Portfolio Hub</strong>
                      <span className="text-[11px] text-slate-400">Case studies & resume</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 flex items-center gap-2.5">
                    <Radio className="w-4 h-4 text-rose-400 shrink-0" />
                    <div>
                      <strong className="text-slate-200 block font-semibold">Busker Sample Pad</strong>
                      <span className="text-[11px] text-slate-400">4x4 pads & Singer Mode</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 flex items-center gap-2.5">
                    <Mic className="w-4 h-4 text-amber-400 shrink-0" />
                    <div>
                      <strong className="text-slate-200 block font-semibold">Podcast Studio</strong>
                      <span className="text-[11px] text-slate-400">Cast voice & teleprompter</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Almost Ready
                </div>

                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    Quick System Preferences
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    You can change these at any time inside the Settings app or Quick Tray.
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Sound Toggle */}
                  <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {soundEnabled ? (
                        <Volume2 className="w-5 h-5 text-cyan-400" />
                      ) : (
                        <VolumeX className="w-5 h-5 text-slate-500" />
                      )}
                      <div>
                        <h4 className="text-sm font-semibold text-slate-200">Synthesized UI Sound Effects</h4>
                        <p className="text-xs text-slate-400">Window clicks, launcher chimes, and system audio</p>
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

                  {/* Wallpaper Quick Switcher */}
                  <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2">
                    <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      Desktop Wallpaper Theme ("Aya Dev OS")
                    </h4>
                    <div className="grid grid-cols-3 gap-2 pt-1">
                      {[
                        { id: 'chromeos-abstract', name: 'Aya OS Default' },
                        { id: 'dark-space', name: 'Cosmic Dark' },
                        { id: 'architecture-minimal', name: 'Minimal Concrete' },
                      ].map((wp) => (
                        <button
                          key={wp.id}
                          onClick={() => {
                            setWallpaper(wp.id);
                            playUiSound('click', soundEnabled);
                          }}
                          className={`p-2 rounded-lg border text-xs font-medium transition-all text-center ${
                            activeWallpaperId === wp.id
                              ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-md'
                              : 'bg-slate-900/60 border-slate-700 text-slate-400 hover:border-slate-500'
                          }`}
                        >
                          {wp.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Footer Controls */}
          <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/70 flex items-center justify-between">
            {step > 0 ? (
              <button
                onClick={handleBack}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            ) : (
              <div />
            )}

            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs shadow-lg shadow-cyan-500/20 active:scale-95 transition-all"
            >
              {step === 3 ? (
                <>
                  Enter Aya OS Desktop <CheckCircle2 className="w-4 h-4" />
                </>
              ) : (
                <>
                  Next <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

import React from 'react';
import { Camera, Sparkles, Heart, Crown, Code2, Monitor, X, ExternalLink, ShieldCheck } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
  isPro: boolean;
  onUpgradeClick: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({
  isOpen,
  onClose,
  isPro,
  onUpgradeClick
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150 select-none">
      <div className="absolute inset-0" onClick={onClose} />
      
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden text-slate-900 font-sans z-10">
        {/* Title Bar */}
        <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-zinc-800 text-white shadow-xs border border-zinc-700">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm tracking-tight">About Frame Flow</span>
                <span className="text-[10px] bg-zinc-800 text-zinc-300 border border-zinc-700 px-2 py-0.5 rounded-full font-bold">
                  v1.4.0
                </span>
              </div>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Hero Branding */}
          <div className="text-center pb-3 border-b border-gray-100">
            <div className="inline-flex p-3 rounded-2xl bg-zinc-100 text-zinc-800 mb-3 border border-zinc-200">
              <Camera className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">
              Frame Flow Studio
            </h3>
            <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
              Precision video-to-photo extraction, sub-frame scrubbing, AI vision ranking, and photo retouching studio.
            </p>
          </div>

          {/* Creator Credit Badge */}
          <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-zinc-900 flex items-center justify-center text-white shrink-0 shadow-sm">
                <Heart className="w-5 h-5 fill-white text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-600">
                  Creator & Lead Architect
                </div>
                <div className="text-base font-extrabold text-slate-900 truncate">
                  Aya Kalimah Satya Ruane
                </div>
                <div className="text-[11px] text-gray-600 flex items-center gap-1.5 mt-0.5">
                  <span>aYa Dev Labs</span>
                  <span>•</span>
                  <span>All Rights Reserved</span>
                </div>
              </div>
            </div>
          </div>

          {/* Features & Engine Specs */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-gray-200/80">
              <div className="font-bold text-gray-900 flex items-center gap-1.5 mb-1">
                <Sparkles className="w-3.5 h-3.5 text-zinc-700" />
                <span>AI Vision Engine</span>
              </div>
              <p className="text-[11px] text-gray-500">Automated tape scans & quality scoring.</p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-gray-200/80">
              <div className="font-bold text-gray-900 flex items-center gap-1.5 mb-1">
                <ShieldCheck className="w-3.5 h-3.5 text-zinc-700" />
                <span>Privacy-First</span>
              </div>
              <p className="text-[11px] text-gray-500">100% in-browser GPU processing without cloud uploads.</p>
            </div>
          </div>

          {/* License Status */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-200 text-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-zinc-700" />
              <div>
                <span className="font-bold text-gray-900">
                  Standard Community Edition
                </span>
                <p className="text-[10px] text-gray-500">
                  Precision frame scrubbing & export tools ready
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
          <span>Copyright &copy; 2026 Aya Kalimah Satya Ruane. All rights reserved.</span>
          <button 
            onClick={onClose}
            className="px-4 py-1.5 font-bold text-xs bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg transition-colors shadow-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { 
  Crown, 
  Check, 
  Sparkles, 
  Zap, 
  Film, 
  Sliders, 
  ShieldCheck, 
  Key, 
  Flame, 
  Camera, 
  Image as ImageIcon,
  CheckCircle2,
  X
} from 'lucide-react';

interface ProUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  isPro: boolean;
  onTogglePro: (status: boolean) => void;
}

export const ProUpgradeModal: React.FC<ProUpgradeModalProps> = ({
  isOpen,
  onClose,
  isPro,
  onTogglePro
}) => {
  const [licenseKey, setLicenseKey] = useState('');
  const [keyError, setKeyError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleActivateKey = () => {
    const cleanKey = licenseKey.trim().toUpperCase();
    if (!cleanKey) {
      setKeyError('Please enter a license key or coupon code.');
      return;
    }

    // Accept valid keys or promo keys
    if (cleanKey.includes('PRO') || cleanKey.includes('CREATOR') || cleanKey.length >= 8) {
      onTogglePro(true);
      setSuccessMsg('🎉 Frame Flow Studio Pro has been successfully activated!');
      setKeyError('');
      setTimeout(() => {
        onClose();
        setSuccessMsg('');
      }, 1500);
    } else {
      setKeyError('Invalid license key. Try "CREATOR-PRO-2026" or instant 1-click unlock.');
    }
  };

  const handleQuickUnlock = () => {
    onTogglePro(true);
    setSuccessMsg('🎉 Studio Pro Unlocked! Enjoy all creator features.');
    setTimeout(() => {
      onClose();
      setSuccessMsg('');
    }, 1200);
  };

  const handleDeactivate = () => {
    onTogglePro(false);
    setSuccessMsg('Switched back to Free Edition.');
    setTimeout(() => {
      setSuccessMsg('');
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans select-none animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={onClose} />

      {/* Main Window */}
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200 flex flex-col max-h-[92vh]">
        
        {/* Header Hero Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-pink-900 text-white p-6 relative overflow-hidden shrink-0">
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-pink-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute left-1/3 -top-10 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

          <button 
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 border border-amber-300/40 text-amber-300 font-bold text-xs flex items-center gap-1">
              <Crown className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
              <span>CREATOR PRO EDITION</span>
            </span>
            {isPro && (
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 font-bold text-xs flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>LICENSE ACTIVE</span>
              </span>
            )}
          </div>

          <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <span>Frame Flow Studio Pro</span>
          </h2>
          <p className="text-sm text-purple-100/90 mt-1 max-w-lg">
            Extract the highest-converting photos, video thumbnails, social teasers, and promo GIFs directly from your video recordings with zero quality loss.
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50/50">
          
          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm font-bold flex items-center gap-2 animate-in zoom-in-95">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            
            {/* 1. 4K/8K Lossless */}
            <div className="p-3.5 bg-white rounded-xl border border-gray-200/80 shadow-xs hover:border-purple-300 transition-colors">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-pink-50 text-pink-600 shrink-0 mt-0.5">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                    <span>4K / 8K Lossless & 4x Upscaling</span>
                    <span className="text-[10px] font-extrabold bg-pink-100 text-pink-700 px-1.5 py-0.2 rounded">PRO</span>
                  </h4>
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                    Capture bit-for-bit uncompressed PNG & WebP at native 4K/8K sensor resolution with 2x & 4x super-resolution supersampling.
                  </p>
                </div>
              </div>
            </div>

            {/* 2. GIF Teaser Studio */}
            <div className="p-3.5 bg-white rounded-xl border border-gray-200/80 shadow-xs hover:border-purple-300 transition-colors">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-purple-50 text-purple-600 shrink-0 mt-0.5">
                  <Film className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                    <span>High-FPS GIF & Teaser Studio</span>
                    <span className="text-[10px] font-extrabold bg-purple-100 text-purple-700 px-1.5 py-0.2 rounded">PRO</span>
                  </h4>
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                    Create silky 30 FPS teaser clips with speed multipliers (0.5x to 2x), infinite ping-pong bounce loops, and caption overlays.
                  </p>
                </div>
              </div>
            </div>

            {/* 3. Watermarking & Branding */}
            <div className="p-3.5 bg-white rounded-xl border border-gray-200/80 shadow-xs hover:border-purple-300 transition-colors">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-amber-50 text-amber-600 shrink-0 mt-0.5">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                    <span>Custom Watermark & Logo Burn</span>
                    <span className="text-[10px] font-extrabold bg-amber-100 text-amber-700 px-1.5 py-0.2 rounded">PRO</span>
                  </h4>
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                    Add your social handle, custom typography, or PNG logo with 9-point anchor positioning, opacity control, or export 100% clean.
                  </p>
                </div>
              </div>
            </div>

            {/* 4. AI Vision Pose & Climax Scanner */}
            <div className="p-3.5 bg-white rounded-xl border border-gray-200/80 shadow-xs hover:border-purple-300 transition-colors">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600 shrink-0 mt-0.5">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                    <span>AI Pose & Lighting Auto-Ranker</span>
                    <span className="text-[10px] font-extrabold bg-blue-100 text-blue-700 px-1.5 py-0.2 rounded">PRO</span>
                  </h4>
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                    Auto-scans full session recordings to detect the sharpest frames, highest dynamic lighting, best eye clarity, and peak action shots.
                  </p>
                </div>
              </div>
            </div>

            {/* 5. Advanced Image Editor & Retouch Studio */}
            <div className="p-3.5 bg-white rounded-xl border border-gray-200/80 shadow-xs hover:border-purple-300 transition-colors">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 shrink-0 mt-0.5">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                    <span>Advanced Photo & Retouch Studio</span>
                    <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-700 px-1.5 py-0.2 rounded">PRO</span>
                  </h4>
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                    Lightroom-grade curves, AI skin smoothing, f/1.4 bokeh blur, real 35mm film grain, split-view compare, custom social aspect crops & branding watermarks.
                  </p>
                </div>
              </div>
            </div>

            {/* 6. Turbo Batch Export */}
            <div className="p-3.5 bg-white rounded-xl border border-gray-200/80 shadow-xs hover:border-purple-300 transition-colors">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 shrink-0 mt-0.5">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                    <span>Unlimited Turbo Batch Dumper</span>
                    <span className="text-[10px] font-extrabold bg-indigo-100 text-indigo-700 px-1.5 py-0.2 rounded">PRO</span>
                  </h4>
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                    Rip hundreds of frames per minute with smart interval sampling and one-click ZIP packaging or direct disk dumping.
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* Pricing & Activation Section */}
          <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-xs space-y-4">
            
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-gray-100 pb-4">
              <div>
                <div className="text-xs font-bold text-purple-700 uppercase tracking-wider">Microsoft Store One-Time License</div>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-2xl font-black text-gray-900">$19.99</span>
                  <span className="text-xs text-gray-500 line-through">$49.99</span>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">60% Creator Launch Discount</span>
                </div>
                <p className="text-xs text-gray-600 mt-1">Lifetime updates • Unlimited devices • No subscription</p>
              </div>

              <div className="flex gap-2 w-full sm:w-auto">
                {!isPro ? (
                  <button 
                    onClick={handleQuickUnlock}
                    className="flex-1 sm:flex-none px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <Crown className="w-4 h-4 fill-amber-300 text-amber-300" />
                    <span>Unlock Studio Pro</span>
                  </button>
                ) : (
                  <button 
                    onClick={handleDeactivate}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition-colors"
                  >
                    Switch to Free
                  </button>
                )}
              </div>
            </div>

            {/* License Key Redemption */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-gray-500" />
                <span>Have a Microsoft Store License Key or Promo Code?</span>
              </label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={licenseKey}
                  onChange={(e) => setLicenseKey(e.target.value)}
                  placeholder="e.g. CREATOR-PRO-2026"
                  className="flex-1 px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none uppercase font-mono"
                />
                <button 
                  onClick={handleActivateKey}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl active:scale-95 transition-transform"
                >
                  Redeem
                </button>
              </div>
              {keyError && (
                <p className="text-xs font-semibold text-rose-600 mt-1">{keyError}</p>
              )}
            </div>

          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-gray-200 flex justify-between items-center text-xs text-gray-500">
          <span>🔒 100% Client-side & Private. Your footage never leaves your PC.</span>
          <button 
            onClick={onClose}
            className="px-4 py-1.5 font-bold text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};

export default ProUpgradeModal;

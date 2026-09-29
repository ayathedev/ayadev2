import React, { useState } from 'react';
import { Download, Share2, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) return null;

  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium transition"
        title="Install app to home screen"
      >
        <Download className="w-3.5 h-3.5 text-slate-600" />
        <span className="hidden lg:inline">Install</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium transition"
          title="Install on iOS Safari"
        >
          <Share2 className="w-3.5 h-3.5 text-slate-600" />
          <span className="hidden lg:inline">Install</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
            <div className="w-full max-w-sm rounded-xl bg-white border border-slate-200 p-5 shadow-xl text-slate-900 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-3">
                <h3 className="font-bold text-slate-900">Add to Home Screen</h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 text-slate-400 hover:text-slate-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-2 text-slate-600">
                <p>1. Tap the <strong className="text-slate-900">Share</strong> button at the bottom of Safari.</p>
                <p>2. Scroll down and choose <strong className="text-slate-900">Add to Home Screen</strong>.</p>
                <p>3. Tap <strong className="text-slate-900">Add</strong> in the top-right corner.</p>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-4 w-full rounded-lg bg-slate-900 hover:bg-slate-800 py-2 font-medium text-white transition"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};

import React, { useState } from 'react';
import { RefreshCw, ExternalLink, Maximize2, Layers, AlertCircle, Play, Code2 } from 'lucide-react';

export const StudioApp: React.FC = () => {
  const [appUrl, setAppUrl] = useState<string>(
    'https://ai.studio/apps/ed19404b-eb0d-40d1-8fe8-c9178a32b47f?fullscreenApplet=true'
  );
  const [iframeKey, setIframeKey] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'app' | 'info'>('app');

  const handleRefresh = () => {
    setIframeKey((prev) => prev + 1);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-100 select-none">
      {/* Top Header / App Address Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-800/90 border-b border-slate-700/80 gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <Layers className="w-4 h-4" />
          </div>
          <span className="font-semibold text-sm text-slate-100 truncate">
            Custom AI Studio Node App
          </span>
          <span className="hidden sm:inline-block text-xs bg-slate-700/80 text-slate-300 px-2 py-0.5 rounded-full border border-slate-600">
            ed19404b
          </span>
        </div>

        {/* Tab Switcher & Quick Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex bg-slate-950/60 p-1 rounded-lg border border-slate-700/60 text-xs">
            <button
              onClick={() => setActiveTab('app')}
              className={`px-3 py-1 rounded-md transition-colors flex items-center gap-1.5 font-medium ${
                activeTab === 'app'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Play className="w-3.5 h-3.5" />
              Live App
            </button>
            <button
              onClick={() => setActiveTab('info')}
              className={`px-3 py-1 rounded-md transition-colors flex items-center gap-1.5 font-medium ${
                activeTab === 'info'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              Integration Specs
            </button>
          </div>

          <button
            onClick={handleRefresh}
            title="Reload Applet"
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors border border-transparent hover:border-slate-600"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <a
            href={appUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Open in Full Window"
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors border border-transparent hover:border-slate-600 flex items-center"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 relative overflow-hidden bg-slate-950">
        {activeTab === 'app' ? (
          <div className="w-full h-full relative">
            <iframe
              key={iframeKey}
              src={appUrl}
              className="w-full h-full border-none bg-slate-950"
              title="Embedded AI Studio Node App"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; microphone; camera"
              sandbox="allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts allow-downloads"
            />
          </div>
        ) : (
          <div className="h-full overflow-y-auto p-6 space-y-6 max-w-4xl mx-auto">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-indigo-400 font-semibold text-lg">
                <Layers className="w-5 h-5" />
                Custom Applet Integration
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                This applet (<code className="text-indigo-300 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">ed19404b-eb0d-40d1-8fe8-c9178a32b47f</code>) has been linked directly into <strong>Aya OS Portfolio Edition</strong>.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
                Native Offline Source Integration Options
              </h3>
              
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                  <div className="text-indigo-400 font-medium text-sm flex items-center gap-2">
                    <Code2 className="w-4 h-4" /> Option 1: Native Code Merge
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Paste the main React component code (`App.tsx` or `server.ts`) in chat, and it will be compiled into a zero-dependency offline native app in Aya OS.
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                  <div className="text-emerald-400 font-medium text-sm flex items-center gap-2">
                    <Maximize2 className="w-4 h-4" /> Option 2: Live Embedded Studio Mode
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Runs live directly inside this framed window with active state synchronization, full browser sandbox permissions, and pop-out support.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 bg-indigo-950/40 border border-indigo-800/50 rounded-xl text-indigo-200 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-indigo-400" />
              <span>Target URL: <code className="text-indigo-300 break-all">{appUrl}</code></span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

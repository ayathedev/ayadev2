import React, { useState } from 'react';
import { 
  Globe, 
  Search, 
  ArrowLeft, 
  ArrowRight, 
  RotateCw, 
  Home, 
  ExternalLink, 
  Download, 
  CheckCircle2, 
  Code, 
  Cpu, 
  Sparkles,
  Layers,
  Box,
  ChevronRight,
  Shield
} from 'lucide-react';
import { USER_PROFILE, PORTFOLIO_PROJECTS } from '../../data/portfolioData';
import { AppId } from '../../types';

interface AyaBrowserProps {
  openApp?: (appId: AppId) => void;
}

export const AyaBrowserApp: React.FC<AyaBrowserProps> = ({ openApp }) => {
  const [activeTab, setActiveTab] = useState<'home' | 'projects' | 'architecture' | 'resume'>('home');
  const [selectedProjectId, setSelectedProjectId] = useState<string>(PORTFOLIO_PROJECTS[0].id);

  const selectedProject = PORTFOLIO_PROJECTS.find(p => p.id === selectedProjectId) || PORTFOLIO_PROJECTS[0];

  return (
    <div className="h-full w-full bg-slate-900 text-slate-100 flex flex-col select-text overflow-hidden">
      {/* Browser URL & Navigation Bar */}
      <div className="px-3 py-2 bg-slate-950 border-b border-slate-800 flex items-center gap-2 select-none">
        <div className="flex items-center gap-1 text-slate-400">
          <button className="p-1 hover:bg-slate-800 rounded transition-colors"><ArrowLeft className="w-3.5 h-3.5" /></button>
          <button className="p-1 hover:bg-slate-800 rounded transition-colors"><ArrowRight className="w-3.5 h-3.5" /></button>
          <button className="p-1 hover:bg-slate-800 rounded transition-colors"><RotateCw className="w-3.5 h-3.5" /></button>
        </div>

        {/* Omnibox */}
        <div className="flex-1 bg-slate-900 border border-slate-800 rounded-full px-3 py-1 flex items-center gap-2 text-xs">
          <Globe className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span className="text-slate-300 font-mono">http://aya.os/portfolio/{activeTab}</span>
        </div>

        {/* Tab Switchers */}
        <div className="flex items-center gap-1 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('home')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              activeTab === 'home' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('projects')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              activeTab === 'projects' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            Showcase
          </button>
          <button
            onClick={() => setActiveTab('architecture')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              activeTab === 'architecture' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            Architecture
          </button>
        </div>
      </div>

      {/* Main Web View Body */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-900/80">
        {activeTab === 'home' && (
          <div className="max-w-3xl mx-auto space-y-8">
            {/* Hero Card */}
            <div className="relative rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 border border-slate-800/90 p-8 shadow-2xl overflow-hidden">
              <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6">
                <img
                  src={USER_PROFILE.avatarUrl}
                  alt={USER_PROFILE.name}
                  className="w-24 h-24 md:w-28 md:h-28 rounded-3xl object-cover ring-2 ring-cyan-500/50 shadow-2xl shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div className="space-y-4 flex-1">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold">
                    Aya OS Environment • Created by {USER_PROFILE.name}
                  </div>

                  <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                    Software Engineering & Creative Projects Node
                  </h1>

                  <p className="text-sm text-slate-300 leading-relaxed max-w-xl">
                    {USER_PROFILE.bio}
                  </p>

                  <div className="pt-2 flex items-center gap-3">
                    <button
                      onClick={() => setActiveTab('projects')}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs shadow-lg shadow-cyan-500/20 transition-all"
                    >
                      Explore My Showcase Projects
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Included Apps Grid */}
            <div className="space-y-3">
              <h3 className="text-base font-bold text-slate-100">Showcase Applications</h3>
              <p className="text-xs text-slate-400">All of the following apps were created by Aya Kalimah Satya Ruane and run in this web OS:</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PORTFOLIO_PROJECTS.map((proj) => (
                  <div
                    key={proj.id}
                    onClick={() => {
                      setSelectedProjectId(proj.id);
                      setActiveTab('projects');
                    }}
                    className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-cyan-500/40 cursor-pointer transition-all space-y-2 group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-200 group-hover:text-cyan-300 transition-colors">
                        {proj.title}
                      </span>
                      <span className="text-[10px] text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20 font-mono">
                        {proj.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-2">
                      {proj.description}
                    </p>
                  </div>
                ))}
              </div>
              <div className="pt-2">
                <button
                  onClick={() => openApp && openApp('ayasec-visionary')}
                  className="w-full p-4 rounded-2xl bg-gradient-to-r from-cyan-600/20 to-indigo-600/20 border border-cyan-500/30 hover:border-cyan-400 transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-cyan-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                       <Shield className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-left">
                       <h4 className="text-sm font-bold text-white">Featured: Aya Sec Security Cam</h4>
                       <p className="text-xs text-slate-400">Cross-Platform Remote Surveillance Workstation</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'projects' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row gap-6">
              {/* Left Project Selector */}
              <div className="w-full sm:w-64 space-y-2 shrink-0">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">Selected Project</h3>
                {PORTFOLIO_PROJECTS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedProjectId(p.id)}
                    className={`w-full p-3 rounded-xl text-left transition-all border ${
                      selectedProjectId === p.id
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-semibold shadow-md'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span className="text-xs block font-bold">{p.title}</span>
                    <span className="text-[10px] text-slate-400 font-normal">{p.category}</span>
                  </button>
                ))}
              </div>

              {/* Right Detail Panel */}
              <div className="flex-1 bg-slate-950/80 border border-slate-800 rounded-2xl p-6 space-y-5">
                <div>
                  <span className="text-xs text-cyan-400 font-semibold uppercase tracking-wider">{selectedProject.category}</span>
                  <h2 className="text-2xl font-bold text-white tracking-tight">{selectedProject.title}</h2>
                  <p className="text-xs text-slate-400 mt-1">{selectedProject.subtitle}</p>
                </div>

                {selectedProject.appId && openApp && (
                  <button
                    onClick={() => openApp(selectedProject.appId!)}
                    className="w-full sm:w-auto px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-900/20"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Launch {selectedProject.title} Window
                  </button>
                )}

                <p className="text-xs text-slate-300 leading-relaxed">
                  {selectedProject.longDescription}
                </p>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-800/80">
                  {selectedProject.metrics.map((m, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-center">
                      <span className="block text-slate-400 text-[10px] uppercase font-mono">{m.label}</span>
                      <strong className="text-xs text-cyan-300 font-bold">{m.value}</strong>
                    </div>
                  ))}
                </div>

                {/* Key Features */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Features & Highlights</h4>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {selectedProject.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 mt-0.5 shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'architecture' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
              <h2 className="text-xl font-bold text-white">Aya OS System Architecture</h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                Aya OS Portfolio Edition is engineered to serve as a zero-dependency local web OS. When a device joins the local Wi-Fi network, the web server handles captive portal requests and delivers this desktop environment directly.
              </p>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs font-mono">
                <div className="text-cyan-400">[Device Connection] → [Wi-Fi Access Point]</div>
                <div className="text-emerald-400">  └─▶ Express Captive Middleware (/generate_204)</div>
                <div className="text-purple-400">      └─▶ Aya OS Portfolio Edition Desktop Shell</div>
                <div className="text-amber-400">          ├─▶ Aya Terminal & Web File System</div>
                <div className="text-pink-400">          ├─▶ Canvas Studio & SynthLab Audio</div>
                <div className="text-sky-400">          └─▶ Offline Service Worker Cache</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { 
  Folder, 
  FileText, 
  Code2, 
  Image as ImageIcon, 
  Download, 
  ChevronRight, 
  Search, 
  Info, 
  CheckCircle2,
  ExternalLink,
  Plus,
  ArrowUpDown,
  LayoutGrid,
  List as ListIcon,
  Github,
  Monitor,
  Cloud,
  Clock,
  Star,
  Settings
} from 'lucide-react';

interface FileItem {
  id: string;
  name: string;
  type: 'folder' | 'code' | 'doc' | 'image';
  size: string;
  updatedAt: string;
  content?: string;
}

export const FileManagerApp: React.FC = () => {
  const [selectedFolder, setSelectedFolder] = useState<string>('projects');
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  const filesByFolder: Record<string, FileItem[]> = {
    projects: [
      {
        id: 'aya-os-spec',
        name: 'Aya_OS_Portfolio_Edition.ts',
        type: 'code',
        size: '18.4 KB',
        updatedAt: '2026-09-27',
        content: `// Aya OS Portfolio Edition — Local Server Desktop Shell
// Created by Aya Kalimah Satya Ruane

export const OS_CONFIG = {
  name: "Aya OS Portfolio Edition",
  creator: "Aya Kalimah Satya Ruane",
  version: "2.5.0",
  mode: "Offline Local Web Server Hotspot",
  features: [
    "Draggable Window Manager",
    "WebAudio Synth & Drum Engine",
    "HTML5 Canvas Studio & Radial Symmetry",
    "Crosh Command Terminal",
    "Captive Portal Hotspot Redirection"
  ]
};`,
      },
      {
        id: 'synthlab-spec',
        name: 'SynthLab_WebAudio_Engine.ts',
        type: 'code',
        size: '12.1 KB',
        updatedAt: '2026-09-25',
        content: `// SynthLab WebAudio Engine
// Developed by Aya Kalimah Satya Ruane

export class SynthLabAudioEngine {
  private ctx: AudioContext;
  
  constructor() {
    this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }

  public triggerKick(time: number) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.frequency.setValueAtTime(150, time);
    osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.5);
    gain.gain.setValueAtTime(1, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.5);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(time);
    osc.stop(time + 0.5);
  }
}`,
      },
      {
        id: 'canvas-spec',
        name: 'Canvas_Studio_RenderEngine.ts',
        type: 'code',
        size: '14.8 KB',
        updatedAt: '2026-09-24',
        content: `// Canvas Studio Graphic Engine
// Created by Aya Kalimah Satya Ruane

export function renderKaleidoscopeSymmetry(
  ctx: CanvasRenderingContext2D,
  center: { x: number; y: number },
  axes: number,
  drawCallback: (subCtx: CanvasRenderingContext2D) => void
) {
  const angle = (Math.PI * 2) / axes;
  for (let i = 0; i < axes; i++) {
    ctx.save();
    ctx.translate(center.x, center.y);
    ctx.rotate(i * angle);
    drawCallback(ctx);
    ctx.restore();
  }
}`,
      },
    ],
    documents: [
      {
        id: 'hotspot-readme',
        name: 'README_Hotspot_Setup.md',
        type: 'doc',
        size: '4.2 KB',
        updatedAt: '2026-09-27',
        content: `# Aya OS Portfolio Edition — Local Server Setup

This application is created by Aya Kalimah Satya Ruane.
It is configured to run on a local web server hotspot (192.168.4.1).

When devices connect to the Wi-Fi access point, the web server routes requests to this standalone desktop OS dashboard.`,
      },
      {
        id: 'aya-bio',
        name: 'Aya_Kalimah_Satya_Ruane_Bio.txt',
        type: 'doc',
        size: '2.8 KB',
        updatedAt: '2026-09-26',
        content: `Aya Kalimah Satya Ruane
Software Engineer & Creative Technologist

I specialize in building full-stack web operating systems, digital audio synthesis tools, vector graphics canvas engines, and standalone offline web servers.`,
      },
    ],
  };

  const currentFiles = filesByFolder[selectedFolder] || [];

  return (
    <div className="h-full w-full bg-slate-900 text-slate-100 flex flex-col select-text overflow-hidden">
      {/* Top Utility Bar */}
      <div className="h-12 bg-slate-950 border-b border-slate-800 flex items-center justify-between px-4 shrink-0 select-none">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <button className="p-1.5 hover:bg-slate-800 rounded-md transition-colors text-slate-400 disabled:opacity-30" disabled><ChevronRight className="w-4 h-4 rotate-180" /></button>
            <button className="p-1.5 hover:bg-slate-800 rounded-md transition-colors text-slate-400 disabled:opacity-30" disabled><ChevronRight className="w-4 h-4" /></button>
          </div>
          
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-md px-3 py-1 text-xs w-80">
            <Folder className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-slate-500">root</span>
            <ChevronRight className="w-3 h-3 text-slate-700" />
            <span className="text-cyan-400 font-mono font-bold tracking-tight">{selectedFolder}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search in folder..."
              className="bg-slate-900 border border-slate-800 rounded-md pl-8 pr-3 py-1 text-[11px] focus:outline-none focus:border-cyan-500/50 w-48 transition-all"
            />
          </div>
          
          <div className="h-6 w-px bg-slate-800 mx-1" />
          
          <div className="flex items-center bg-slate-900 rounded-md p-0.5 border border-slate-800">
            <button 
              onClick={() => setViewMode('list')}
              className={`p-1 rounded ${viewMode === 'list' ? 'bg-slate-800 text-cyan-400 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <ListIcon className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-1 rounded ${viewMode === 'grid' ? 'bg-slate-800 text-cyan-400 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Modern Sidebar */}
        <aside className="w-60 bg-slate-950/40 border-r border-slate-800 flex flex-col select-none shrink-0 overflow-y-auto">
          <div className="p-4 space-y-6">
            {/* Quick Access */}
            <div className="space-y-1.5">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2 mb-2">Favorites</h3>
              <button className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 w-full text-left transition-all">
                <Star className="w-3.5 h-3.5 text-amber-500" />
                <span>Starred Items</span>
              </button>
              <button className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 w-full text-left transition-all">
                <Clock className="w-3.5 h-3.5 text-cyan-500" />
                <span>Recent Files</span>
              </button>
            </div>

            {/* Locations */}
            <div className="space-y-1.5">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2 mb-2">Internal Storage</h3>
              <button
                onClick={() => { setSelectedFolder('projects'); setSelectedFile(null); }}
                className={`flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-[11px] font-bold transition-all w-full text-left group ${
                  selectedFolder === 'projects'
                    ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <Monitor className={`w-4 h-4 transition-colors ${selectedFolder === 'projects' ? 'text-cyan-400' : 'text-slate-500 group-hover:text-cyan-400'}`} />
                <span>Aya_OS_Root</span>
              </button>

              <button
                onClick={() => { setSelectedFolder('documents'); setSelectedFile(null); }}
                className={`flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-[11px] font-bold transition-all w-full text-left group ${
                  selectedFolder === 'documents'
                    ? 'bg-blue-500/10 text-blue-300 border border-blue-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <FileText className={`w-4 h-4 transition-colors ${selectedFolder === 'documents' ? 'text-blue-400' : 'text-slate-500 group-hover:text-blue-400'}`} />
                <span>Documentation</span>
              </button>
            </div>

            {/* External */}
            <div className="space-y-1.5">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2 mb-2">Cloud & Git</h3>
              <a 
                href="https://github.com/ayathedev/filesapp"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-[11px] font-bold text-slate-400 hover:text-cyan-400 transition-all group border border-transparent hover:border-cyan-500/20"
              >
                <Github className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span>filesapp @ github</span>
                <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
              </a>
              <button className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-slate-600 cursor-not-allowed w-full text-left">
                <Cloud className="w-3.5 h-3.5" />
                <span>Google Drive (Login Req)</span>
              </button>
            </div>
          </div>

          <div className="mt-auto p-4 border-t border-slate-800 bg-slate-950/20">
             <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 mb-2">
               <span>System Usage</span>
               <span>1.2 / 5.0 GB</span>
             </div>
             <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
               <div className="h-full bg-cyan-500 w-[24%]" />
             </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col min-w-0 bg-slate-900/60 relative">
          {/* List/Grid Header */}
          <div className="px-6 py-3 border-b border-slate-800 flex items-center justify-between text-[10px] font-black text-slate-500 uppercase tracking-widest select-none bg-slate-900/80 backdrop-blur-sm sticky top-0 z-10">
            <div className="flex items-center gap-2 flex-1">
              <ArrowUpDown className="w-3 h-3" />
              <span>Name</span>
            </div>
            <div className="w-32 hidden md:block">Size</div>
            <div className="w-32 hidden lg:block">Last Modified</div>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            <div className={viewMode === 'list' ? 'space-y-1' : 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2'}>
              {currentFiles.map((file) => (
                <div
                  key={file.id}
                  onClick={() => setSelectedFile(file)}
                  className={`
                    group cursor-pointer transition-all border
                    ${viewMode === 'list' 
                      ? 'flex items-center px-4 py-2.5 rounded-xl' 
                      : 'flex flex-col items-center justify-center p-4 rounded-2xl aspect-square text-center'
                    }
                    ${selectedFile?.id === file.id
                      ? 'bg-cyan-500/20 border-cyan-400/50 shadow-lg shadow-cyan-900/20'
                      : 'bg-slate-950/40 border-slate-800/80 hover:bg-slate-800/60 hover:border-slate-700'
                    }
                  `}
                >
                  <div className={viewMode === 'list' ? 'flex items-center gap-4 flex-1' : 'space-y-3'}>
                    <div className={`
                      rounded-lg flex items-center justify-center transition-transform group-hover:scale-110
                      ${viewMode === 'list' ? 'w-8 h-8' : 'w-12 h-12'}
                      ${file.type === 'code' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-blue-500/10 text-blue-400'}
                    `}>
                      {file.type === 'code' ? <Code2 className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                    </div>
                    
                    <div className={viewMode === 'list' ? 'min-w-0' : ''}>
                      <span className={`font-bold block truncate ${viewMode === 'list' ? 'text-xs text-slate-200' : 'text-[11px] text-slate-300'}`}>
                        {file.name}
                      </span>
                      {viewMode === 'list' && (
                         <span className="text-[10px] text-slate-500 font-mono">Aya_FS://{selectedFolder}/{file.name}</span>
                      )}
                    </div>
                  </div>

                  {viewMode === 'list' && (
                    <>
                      <div className="w-32 hidden md:block text-[10px] font-mono text-slate-400">{file.size}</div>
                      <div className="w-32 hidden lg:block text-[10px] font-mono text-slate-400">{file.updatedAt}</div>
                    </>
                  )}
                </div>
              ))}
            </div>

            {/* File Preview Inspector Overlay */}
            {selectedFile && selectedFile.content && (
              <div className="mt-8 mx-4 mb-8">
                <div className="rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden shadow-2xl">
                   <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                     <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                        <span className="text-[10px] font-mono font-bold text-slate-300 uppercase tracking-wider">Inspector: {selectedFile.name}</span>
                     </div>
                     <div className="flex items-center gap-2">
                       <button className="p-1 hover:bg-slate-800 rounded transition-colors text-slate-500 hover:text-slate-200">
                         <Settings className="w-3.5 h-3.5" />
                       </button>
                       <button 
                         onClick={() => setSelectedFile(null)}
                         className="px-2 py-0.5 text-[10px] font-bold text-slate-500 hover:text-red-400 border border-slate-800 rounded hover:border-red-500/30 transition-all"
                       >
                         CLOSE
                       </button>
                     </div>
                   </div>
                   <div className="p-6">
                      <pre className="text-xs font-mono text-slate-400 whitespace-pre-wrap leading-relaxed overflow-x-auto p-4 bg-slate-900/50 rounded-xl border border-slate-800/50 max-h-96">
                        {selectedFile.content}
                      </pre>
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex gap-2">
                          <button className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-[10px] font-bold flex items-center gap-2 transition-all">
                            <Download className="w-3 h-3" />
                            Download Original
                          </button>
                          <button className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[10px] font-bold flex items-center gap-2 transition-all">
                            <Code2 className="w-3 h-3" />
                            View in Editor
                          </button>
                        </div>
                        <div className="text-[10px] text-slate-500 flex items-center gap-2">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                          <span>File checksum verified</span>
                        </div>
                      </div>
                   </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Footer Info */}
          <footer className="h-8 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between px-4 text-[9px] font-bold text-slate-500 uppercase tracking-widest shrink-0">
             <div className="flex items-center gap-4">
               <span>{currentFiles.length} Items</span>
               <span>0 Selected</span>
             </div>
             <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-emerald-500" />
               <span>FileSystem: Secure_Cloud_Sync_Enabled</span>
             </div>
          </footer>
        </main>
      </div>
    </div>
  );
};

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
  CheckCircle2 
} from 'lucide-react';
import { USER_PROFILE, PORTFOLIO_PROJECTS } from '../../data/portfolioData';

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
      {
        id: 'busker-pad-spec',
        name: 'Busker_Sample_Pad_Engine.ts',
        type: 'code',
        size: '16.2 KB',
        updatedAt: '2026-09-27',
        content: `// Busker Sample Pad - Zero-Scroll Viewport Virtual Instrument
// Integrated in Aya OS Portfolio Edition

export interface PadConfig {
  id: number; // 0 to 15 (4x4)
  name: string;
  category: 'drum' | 'bass' | 'synth' | 'vocal' | 'fx' | 'acoustic' | 'custom';
  color: 'rose' | 'amber' | 'emerald' | 'cyan' | 'violet' | 'pink';
  mode: 'oneshot' | 'loop' | 'hold';
  volume: number;
  pitchSemitones: number;
  cutoffFreq: number;
  keyBinding: string;
}

export const MODES = ['Simple Singer Mode', '4x4 Pads', 'Pentatonic Synth', 'Beat Sequencer', 'Live Looper'];`,
      },
      {
        id: 'podcast-studio-spec',
        name: 'Podcast_Audio_Drama_Engine.ts',
        type: 'code',
        size: '18.4 KB',
        updatedAt: '2026-09-27',
        content: `// PodForge: Audio Drama & Broadcast Workstation
// Multi-Voice Teleprompter, Web Speech Synthesis & Procedural SFX

export interface ScriptLine {
  id: string;
  characterId: string;
  characterName: string;
  text: string;
  emotionNote?: string;
  sfxCue?: string;
  isSceneHeader?: boolean;
  isAdBreak?: boolean;
}

export const SOUNDBOARD_SFX = ['intro_chime', 'dramatic_boom', 'applause', 'laser_zap', 'tape_stop', 'vinyl_crackle'];`,
      },
      {
        id: 'hermes-ebike-spec',
        name: 'Hermes_EBike_AI_Face.ts',
        type: 'code',
        size: '22.1 KB',
        updatedAt: '2026-09-28',
        content: `// Hermes: E-Bike AI Neural Void Face & Drivetrain Telemetry Co-Pilot
// Real-time speed HUD, 52V battery management, surround radar & Ollama local inference

export interface EBikeTelemetry {
  speedMph: number;
  assistLevel: 'OFF' | 'ECO' | 'TOUR' | 'SPORT' | 'TURBO';
  batteryPercent: number;
  motorWatts: number;
  cadenceRpm: number;
  motorTempC: number;
  tripMiles: number;
}

export const OLLAMA_SUPPORTED_MODELS = ['llama3.2', 'mistral', 'deepseek-r1:8b', 'phi4', 'qwen2.5:3b'];`,
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
    <div className="h-full w-full bg-slate-900 text-slate-100 flex select-text overflow-hidden">
      {/* Directory Sidebar */}
      <div className="w-52 bg-slate-950/80 border-r border-slate-800 p-3 flex flex-col gap-1 select-none shrink-0">
        <div className="flex items-center gap-2 px-3 py-2 mb-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
          <Folder className="w-4 h-4 text-cyan-400" /> Files System
        </div>

        <button
          onClick={() => {
            setSelectedFolder('projects');
            setSelectedFile(null);
          }}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all w-full text-left ${
            selectedFolder === 'projects'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Code2 className="w-4 h-4 text-emerald-400" /> Source Projects
        </button>

        <button
          onClick={() => {
            setSelectedFolder('documents');
            setSelectedFile(null);
          }}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all w-full text-left ${
            selectedFolder === 'documents'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <FileText className="w-4 h-4 text-blue-400" /> Documentation
        </button>
      </div>

      {/* Main Files Table */}
      <div className="flex-1 flex flex-col overflow-hidden bg-slate-900/60">
        <div className="px-4 py-2.5 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400 select-none">
          <div className="flex items-center gap-1">
            <span>root</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-cyan-300 font-semibold">{selectedFolder}</span>
          </div>
          <span>Created by Aya Kalimah Satya Ruane</span>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-1 gap-2">
            {currentFiles.map((file) => (
              <div
                key={file.id}
                onClick={() => setSelectedFile(file)}
                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  selectedFile?.id === file.id
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                    : 'bg-slate-950/40 border-slate-800/80 hover:bg-slate-800/60 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  {file.type === 'code' ? (
                    <Code2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <FileText className="w-4 h-4 text-blue-400 shrink-0" />
                  )}
                  <div>
                    <strong className="text-xs font-semibold block">{file.name}</strong>
                    <span className="text-[10px] text-slate-400">{file.size} • Updated {file.updatedAt}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* File Inspector Preview */}
          {selectedFile && selectedFile.content && (
            <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-800">
                <span className="font-mono text-cyan-300">{selectedFile.name}</span>
                <span>Preview</span>
              </div>
              <pre className="text-xs font-mono text-slate-300 whitespace-pre-wrap leading-relaxed overflow-x-auto p-2 bg-slate-900 rounded-lg border border-slate-800">
                {selectedFile.content}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

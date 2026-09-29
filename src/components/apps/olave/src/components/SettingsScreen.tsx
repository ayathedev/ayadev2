
import React, { useState } from 'react';
import { ArrowLeft, Upload, FileText, AlertCircle, CheckCircle2, Download, Zap, Code2 } from 'lucide-react';

interface SettingsScreenProps {
  onBack: () => void;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ onBack }) => {
  const [status, setStatus] = useState<'idle' | 'validating' | 'error' | 'success'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.ayascript')) {
      setStatus('error');
      setErrorMessage('Invalid file extension. Please upload a .ayascript file.');
      generateDebugFile('Error: Invalid file extension. Expected .ayascript');
      return;
    }

    setStatus('validating');
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      // Mock validation logic for AyaScript Engine
      setTimeout(() => {
        // Simplified check: any script containing "error" or missing standard headers fails
        if (content.toLowerCase().includes('error') || !content.includes('effect')) {
          setStatus('error');
          const err = "AyaScript Compiler Error [0xAF4]:\nSyntax mismatch detected in effect definition block.\nLine 4: 'Unexpected token <sequence>'.\nAyaScript requires explicit block scoping for custom shaders.";
          setErrorMessage(err);
          generateDebugFile(err);
        } else {
          setStatus('success');
        }
      }, 2000);
    };
    reader.readAsText(file);
  };

  const generateDebugFile = (text: string) => {
    const element = document.createElement('a');
    const file = new Blob([text], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = "ayascript_debug.log";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="h-screen w-screen bg-slate-950 flex flex-col font-inter text-slate-100">
      <header className="h-20 border-b border-white/5 flex items-center px-10 justify-between bg-slate-900/50 backdrop-blur-xl">
        <div className="flex items-center gap-6">
          <button onClick={onBack} className="p-3 hover:bg-white/5 rounded-2xl transition-all text-slate-400 hover:text-white"><ArrowLeft size={24} /></button>
          <h1 className="text-2xl font-black uppercase tracking-tighter italic">Global <span className="text-red-600">Settings</span></h1>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-10 max-w-4xl mx-auto w-full space-y-12 pb-24">
        <section className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600/20 rounded-2xl flex items-center justify-center text-blue-400 border border-blue-500/20 shadow-lg"><Zap size={24} /></div>
            <div>
              <h2 className="text-lg font-black uppercase tracking-widest text-white">AyaScript Engine</h2>
              <p className="text-xs text-slate-500 font-medium">Modular effect orchestration and GPU shader injection</p>
            </div>
          </div>

          <div className="bg-slate-900 border border-white/5 rounded-[2.5rem] p-10 space-y-8 shadow-3xl">
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-[2rem] py-16 px-8 group hover:border-blue-500/40 transition-all cursor-pointer relative bg-black/20">
              <input type="file" accept=".ayascript" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center text-slate-500 mb-6 group-hover:scale-110 transition-transform group-hover:text-blue-400"><Upload size={40} /></div>
              <p className="text-base font-black uppercase tracking-[0.2em] text-slate-300">Load .ayascript Extension</p>
              <p className="text-[10px] text-slate-600 mt-4 font-mono uppercase tracking-[0.4em]">Compiler: AyaScript v2.0-Core</p>
            </div>

            {status === 'validating' && (
              <div className="flex items-center gap-4 bg-blue-500/10 p-5 rounded-2xl border border-blue-500/20 animate-pulse">
                <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs font-black uppercase tracking-widest text-blue-400">Compiling AyaScript Modules...</span>
              </div>
            )}

            {status === 'error' && (
              <div className="flex flex-col gap-4 bg-red-500/5 p-8 rounded-3xl border border-red-500/20 shadow-inner">
                <div className="flex items-center gap-3">
                  <AlertCircle size={24} className="text-red-500" />
                  <span className="text-xs font-black uppercase tracking-widest text-red-500">Compilation Interrupted</span>
                </div>
                <pre className="text-[10px] font-mono text-red-300/70 bg-black/60 p-5 rounded-2xl leading-loose border border-red-950 overflow-x-auto">{errorMessage}</pre>
                <button onClick={() => generateDebugFile(errorMessage)} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/50 hover:text-white transition-all bg-white/5 px-4 py-2 rounded-full w-fit">
                  <Download size={14} /> Fetch ayascript_debug.log
                </button>
              </div>
            )}

            {status === 'success' && (
              <div className="flex items-center gap-4 bg-emerald-500/10 p-5 rounded-2xl border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.1)]">
                <CheckCircle2 size={24} className="text-emerald-500" />
                <span className="text-xs font-black uppercase tracking-widest text-emerald-400">Module Integrated Successfully</span>
              </div>
            )}
          </div>
        </section>

        <section className="bg-slate-900 border border-white/5 rounded-[2.5rem] p-10 shadow-xl">
           <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-6">
              <div className="flex items-center gap-3">
                <Code2 size={20} className="text-slate-400" />
                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">AyaScript Syntax Reference</h3>
              </div>
              <FileText size={18} className="text-slate-700" />
           </div>
           <div className="space-y-6 text-xs text-slate-400 font-medium leading-relaxed">
              <p>The <span className="text-white font-bold">AyaScript language</span> is optimized for GPU-bound visual transformations. It allows for direct manipulation of frame buffers and audio streams through high-level effect blocks.</p>
              <div className="bg-black/60 p-6 rounded-[2rem] font-mono text-[10px] text-blue-300 border border-white/5 shadow-inner">
                <span className="text-slate-600 italic">// Define a custom cinematic post-process</span><br/>
                <span className="text-red-400">effect</span> "CyberVibe" {"{"}<br/>
                &nbsp;&nbsp;<span className="text-purple-400">layer</span> "Shadows" {"{"}<br/>
                &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-emerald-400">tint</span>(#000033);<br/>
                &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-emerald-400">contrast</span>(1.4);<br/>
                &nbsp;&nbsp;{"}"}<br/>
                &nbsp;&nbsp;<span className="text-purple-400">glitch</span>(intensity: 0.2, frequency: 0.5);<br/>
                &nbsp;&nbsp;<span className="text-purple-400">bloom</span>(radius: 12, strength: 0.8);<br/>
                {"}"}
              </div>
              <div className="flex items-center gap-2 p-4 bg-white/5 rounded-2xl">
                <AlertCircle size={14} className="text-slate-500" />
                <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Compiler warning: Unclosed effect blocks will cause sequence desync.</p>
              </div>
           </div>
        </section>
      </main>
    </div>
  );
};

export default SettingsScreen;

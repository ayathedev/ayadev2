import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Search, 
  Filter, 
  Layers, 
  BookOpen, 
  Network, 
  Lock, 
  FileJson, 
  Activity, 
  ExternalLink,
  ChevronRight,
  Target,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';

interface DefensiveControl {
  id: string;
  name: string;
  category: string;
  phase: 'Preparation' | 'Detection' | 'Response' | 'Recovery';
  mapping: string;
  description: string;
}

const CONTROLS: DefensiveControl[] = [
  { id: 'DEF-001', name: 'RAG Source Verification', category: 'Integrity', phase: 'Detection', mapping: 'OWASP LLM01', description: 'Validate the authenticity and integrity of retrieved documents before injection into the prompt context.' },
  { id: 'DEF-002', name: 'Prompt Injection Sanitization', category: 'Input Filtering', phase: 'Preparation', mapping: 'MITRE AML.T0054', description: 'Strip malicious escape sequences and system prompt override attempts from user-provided inputs.' },
  { id: 'DEF-003', name: 'Model Weight Integrity Check', category: 'Supply Chain', phase: 'Preparation', mapping: 'NIST AI 100-1', description: 'Cryptographic hashing of model weights to detect unauthorized tampering or backdoors during deployment.' },
  { id: 'DEF-004', name: 'PII Scrubbing (Outgoing)', category: 'Privacy', phase: 'Response', mapping: 'GDPR / HIPAA', description: 'Automated redaction of sensitive personal information from LLM-generated responses before delivery.' },
  { id: 'DEF-005', name: 'Agentic Tool-Use Sandboxing', category: 'Execution Control', phase: 'Preparation', mapping: 'OWASP LLM07', description: 'Isolate external tool execution (APIs, Shells) within ephemeral, zero-trust container environments.' },
  { id: 'DEF-006', name: 'Semantic Outlier Detection', category: 'Anomaly', phase: 'Detection', mapping: 'ATLAS AML.T0001', description: 'Monitoring embedding vectors for anomalous distributions that may indicate adversarial evasion attempts.' }
];

export const AiDefendApp: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedControl, setSelectedControl] = useState<DefensiveControl | null>(CONTROLS[0]);

  const filteredControls = CONTROLS.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full w-full bg-slate-950 text-slate-200 flex flex-col font-sans select-none overflow-hidden">
      {/* Security Header */}
      <header className="h-16 border-b border-cyan-900/30 bg-slate-900/60 backdrop-blur-xl flex items-center justify-between px-6 shrink-0 z-20">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-cyan-600 rounded-lg shadow-lg shadow-cyan-900/30 border border-cyan-400/20">
            <ShieldAlert className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight flex items-center gap-2">
              AIDEFEND™
              <span className="text-[10px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded uppercase font-mono">v1.2026</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase opacity-70">AI Defense Framework Knowledge Base</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-6 mr-6">
            <div className="text-center">
              <div className="text-xs font-black text-cyan-400">307</div>
              <div className="text-[9px] text-slate-500 uppercase font-bold">Controls</div>
            </div>
            <div className="text-center border-l border-slate-800 pl-6">
              <div className="text-xs font-black text-cyan-400">9</div>
              <div className="text-[9px] text-slate-500 uppercase font-bold">Frameworks</div>
            </div>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-cyan-600/10 hover:bg-cyan-600/20 text-cyan-400 border border-cyan-600/30 rounded-xl text-xs font-bold transition-all">
            <FileJson className="w-4 h-4" />
            <span className="hidden sm:inline">Export Dataset</span>
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Navigation / Exploration Sidebar */}
        <aside className="w-72 border-r border-slate-800 bg-slate-900/20 flex flex-col shrink-0">
          <div className="p-4 space-y-4">
            <div className="relative group">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
              <input 
                type="text" 
                placeholder="Search controls..." 
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs focus:ring-1 focus:ring-cyan-600 outline-none transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <nav className="space-y-1">
              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold bg-cyan-600/10 text-cyan-400 border border-cyan-600/20 shadow-sm">
                <Layers className="w-4 h-4" />
                Tactics View
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 transition-all">
                <Network className="w-4 h-4" />
                Pillars
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 transition-all">
                <Activity className="w-4 h-4" />
                Lifecycle Phases
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 transition-all">
                <Target className="w-4 h-4" />
                Framework Mappings
              </button>
            </nav>
          </div>

          <div className="mt-auto p-6 space-y-4">
            <div className="p-4 rounded-2xl bg-cyan-500/5 border border-cyan-500/10">
              <div className="flex items-center gap-2 mb-2">
                <Lock className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">Active Guard</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed italic">
                Framework updated to 2026 Standard. Synchronizing with MITRE ATLAS feed.
              </p>
            </div>
            <a 
              href="https://github.com/ayathedev/infadv" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all"
            >
              Open Source Repo
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </aside>

        {/* Content Explorer */}
        <main className="flex-1 flex flex-col bg-slate-950 overflow-hidden">
          <div className="flex-1 flex overflow-hidden">
            {/* List View */}
            <div className="w-96 border-r border-slate-800 flex flex-col shrink-0 bg-slate-900/10">
              <div className="p-4 border-b border-slate-800 bg-slate-900/40">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Defensive Library</span>
                  <Filter className="w-3.5 h-3.5 text-slate-600" />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                <div className="space-y-1">
                  {filteredControls.map((control) => (
                    <button
                      key={control.id}
                      onClick={() => setSelectedControl(control)}
                      className={`w-full flex flex-col p-3 rounded-xl transition-all text-left ${
                        selectedControl?.id === control.id 
                          ? 'bg-slate-800 ring-1 ring-cyan-500/30' 
                          : 'hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-mono text-cyan-500 font-bold">{control.id}</span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                          control.phase === 'Preparation' ? 'bg-blue-500/10 text-blue-400' :
                          control.phase === 'Detection' ? 'bg-orange-500/10 text-orange-400' :
                          'bg-emerald-500/10 text-emerald-400'
                        }`}>
                          {control.phase}
                        </span>
                      </div>
                      <h4 className={`text-xs font-bold truncate ${selectedControl?.id === control.id ? 'text-white' : 'text-slate-400'}`}>
                        {control.name}
                      </h4>
                      <p className="text-[10px] text-slate-600 mt-1 truncate">{control.category} • {control.mapping}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Detailed View */}
            <div className="flex-1 overflow-y-auto p-12 custom-scrollbar relative">
              {selectedControl ? (
                <div className="max-w-3xl space-y-10">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 bg-cyan-600/10 border border-cyan-600/30 text-cyan-400 text-[10px] font-mono font-bold rounded-lg">
                        {selectedControl.id}
                      </span>
                      <span className="text-slate-600">•</span>
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{selectedControl.category} Control</span>
                    </div>
                    <h2 className="text-4xl font-black tracking-tight text-white">{selectedControl.name}</h2>
                    <p className="text-lg text-slate-400 leading-relaxed font-medium italic">
                      "{selectedControl.description}"
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                      <div className="flex items-center gap-2 text-cyan-400">
                        <ShieldCheck className="w-5 h-5" />
                        <h3 className="text-xs font-black uppercase tracking-widest">Verification Guidance</h3>
                      </div>
                      <ul className="text-xs text-slate-500 space-y-2 list-disc pl-4">
                        <li>Validate component isolation via zero-trust policy enforcement.</li>
                        <li>Verify checksum consistency across distributed nodes.</li>
                        <li>Perform red-team bypass testing on input validation layers.</li>
                      </ul>
                    </div>
                    <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                      <div className="flex items-center gap-2 text-orange-400">
                        <AlertTriangle className="w-5 h-5" />
                        <h3 className="text-xs font-black uppercase tracking-widest">Threat Mappings</h3>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-400">MITRE ATLAS</span>
                          <span className="font-mono text-white">AML.T0054</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-400">OWASP LLM</span>
                          <span className="font-mono text-white">LLM01: Prompt Inj.</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-400">NIST AI Risk</span>
                          <span className="font-mono text-white">Measure 2.4</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6 pt-10 border-t border-slate-800">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-cyan-400" />
                      <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Implementation Guidance</h3>
                    </div>
                    <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 font-mono text-[11px] text-cyan-200/70 leading-relaxed">
                      // PRODUCTION EXAMPLE: {selectedControl.name} Implementation<br/>
                      // Scope: {selectedControl.phase} stage defensive baseline<br/><br/>
                      const secureContext = await Aidefend.initialize(&#123;<br/>
                      &nbsp;&nbsp;strictMode: true,<br/>
                      &nbsp;&nbsp;mapping: "{selectedControl.mapping}",<br/>
                      &nbsp;&nbsp;controlId: "{selectedControl.id}"<br/>
                      &#125;);<br/><br/>
                      return secureContext.validateInput(userPayload).then(result =&gt; &#123;<br/>
                      &nbsp;&nbsp;if (!result.secure) throw new AiSecurityException(result.threatVector);<br/>
                      &nbsp;&nbsp;return result.sanitizedPayload;<br/>
                      &#125;);
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-30">
                  <ShieldAlert className="w-24 h-24 text-slate-800" />
                  <p className="text-sm font-bold uppercase tracking-widest text-slate-600">Select a defensive control to inspect details</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

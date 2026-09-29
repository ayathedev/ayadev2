import React, { useState } from 'react';
import { 
  PenTool, 
  Search, 
  ChevronRight, 
  ChevronDown, 
  FileText, 
  Folder, 
  BookOpen, 
  Settings, 
  Eye, 
  Type, 
  Hash, 
  Users, 
  Map, 
  Save, 
  Download,
  Clock,
  MoreVertical,
  MinusSquare,
  PlusSquare,
  Maximize2
} from 'lucide-react';

interface NovelDocument {
  id: string;
  name: string;
  type: 'folder' | 'document';
  children?: NovelDocument[];
  isOpen?: boolean;
}

export const NovelWriterApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState('editor');
  const [activeDocId, setActiveDocId] = useState('doc-1');
  const [content, setContent] = useState(
    "# Chapter One: The Hotspot\n\nThe air was thick with the scent of ozone and cooling servers. Aya adjusted the antenna on the local node, watching the signal strength bars bounce on her screen. This wasn't just a portfolio; it was a sanctuary.\n\n@Aya: Need to check the frequency modulation on the OL-AVE integration.\n\nShe typed quickly, the minimal markdown syntax appearing as clean, structured thoughts. The multi-document organization made it easy to jump between the legislative research for HB 249 and the technical specs of her audio engine.\n\n[[Character: Aya]]\n[[Location: The Server Room]]"
  );

  const projectTree: NovelDocument[] = [
    { 
      id: 'f-1', name: 'Manuscript', type: 'folder', isOpen: true,
      children: [
        { id: 'f-2', name: 'Front Matter', type: 'folder', children: [] },
        { 
          id: 'f-3', name: 'Part I: The Node', type: 'folder', isOpen: true,
          children: [
            { id: 'doc-1', name: 'Chapter 1: The Hotspot', type: 'document' },
            { id: 'doc-2', name: 'Chapter 2: Signal Drift', type: 'document' },
            { id: 'doc-3', name: 'Chapter 3: Local Host', type: 'document' },
          ]
        },
        { id: 'f-4', name: 'Part II: The Network', type: 'folder', children: [] },
      ]
    },
    { 
      id: 'f-5', name: 'Notes & Research', type: 'folder', isOpen: true,
      children: [
        { id: 'doc-4', name: 'Aya: Character Arc', type: 'document' },
        { id: 'doc-5', name: 'Legislative Timeline', type: 'document' },
        { id: 'doc-6', name: 'Technical Schematic', type: 'document' },
      ]
    }
  ];

  return (
    <div className="h-full w-full bg-white text-stone-900 flex flex-col font-sans select-none overflow-hidden">
      {/* Writer App Bar */}
      <header className="h-14 border-b border-stone-200 bg-stone-50 flex items-center justify-between px-4 shrink-0 z-20">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-stone-900 rounded-lg shadow-lg shadow-stone-200">
            <PenTool className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-black tracking-tight uppercase italic">NovelWriter OS</h1>
            <p className="text-[10px] text-stone-500 font-bold leading-none">Manuscript Editor // Draft v1.0</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-stone-200/50 border border-stone-300 text-[10px] font-bold text-stone-600">
            <Clock className="w-3 h-3" />
            Last saved: Just now
          </div>
          <button className="p-2 hover:bg-stone-200 rounded-lg text-stone-600 transition-colors">
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Project Explorer Sidebar */}
        <aside className="w-64 border-r border-stone-200 bg-stone-100/30 flex flex-col shrink-0">
          <div className="p-4 border-b border-stone-200 flex items-center justify-between">
            <h3 className="text-[10px] font-black text-stone-500 uppercase tracking-widest">Project Tree</h3>
            <div className="flex items-center gap-1">
              <button className="p-1 hover:bg-stone-200 rounded text-stone-500"><PlusSquare className="w-3.5 h-3.5" /></button>
              <button className="p-1 hover:bg-stone-200 rounded text-stone-500"><Search className="w-3.5 h-3.5" /></button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
            {projectTree.map(root => (
              <div key={root.id} className="space-y-1">
                <div className="flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-stone-200/50 cursor-pointer group">
                  {root.isOpen ? <ChevronDown className="w-3 h-3 text-stone-400" /> : <ChevronRight className="w-3 h-3 text-stone-400" />}
                  <Folder className="w-3.5 h-3.5 text-amber-500 fill-amber-500/20" />
                  <span className="text-xs font-bold text-stone-700">{root.name}</span>
                </div>
                {root.isOpen && root.children?.map(child => (
                  <div key={child.id} className="pl-4 space-y-1">
                    <div className="flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-stone-200/50 cursor-pointer group">
                      {child.type === 'folder' ? (
                        <>
                          {child.isOpen ? <ChevronDown className="w-3 h-3 text-stone-400" /> : <ChevronRight className="w-3 h-3 text-stone-400" />}
                          <Folder className="w-3.5 h-3.5 text-stone-400 fill-stone-400/10" />
                          <span className="text-xs font-bold text-stone-600">{child.name}</span>
                        </>
                      ) : (
                        <>
                          <div className="w-3" />
                          <FileText className={`w-3.5 h-3.5 ${activeDocId === child.id ? 'text-stone-900' : 'text-stone-400'}`} />
                          <span className={`text-xs font-medium ${activeDocId === child.id ? 'font-bold text-stone-900' : 'text-stone-500'}`}>{child.name}</span>
                        </>
                      )}
                    </div>
                    {child.isOpen && child.children?.map(leaf => (
                      <div key={leaf.id} className="pl-6">
                        <div 
                          onClick={() => setActiveDocId(leaf.id)}
                          className={`flex items-center gap-1 px-2 py-1.5 rounded-lg cursor-pointer transition-all ${
                            activeDocId === leaf.id ? 'bg-stone-900 text-white shadow-sm' : 'hover:bg-stone-200/50'
                          }`}
                        >
                          <FileText className={`w-3.5 h-3.5 ${activeDocId === leaf.id ? 'text-stone-300' : 'text-stone-400'}`} />
                          <span className={`text-xs ${activeDocId === leaf.id ? 'font-bold' : 'text-stone-500'}`}>{leaf.name}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-stone-200 bg-stone-50/50">
            <div className="flex items-center justify-between text-[10px] font-black text-stone-500 uppercase tracking-widest mb-3">
              <span>Writing Progress</span>
              <BookOpen className="w-3 h-3" />
            </div>
            <div className="space-y-2">
              <div className="h-1.5 bg-stone-200 rounded-full overflow-hidden">
                <div className="h-full bg-stone-900 w-[12%]" />
              </div>
              <div className="flex justify-between text-[9px] text-stone-500 font-mono">
                <span>12,402 / 100,000 words</span>
                <span>12%</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Editor Main Surface */}
        <main className="flex-1 flex flex-col bg-white overflow-hidden">
          {/* Format Bar */}
          <div className="h-10 border-b border-stone-200 flex items-center px-6 gap-6 shrink-0 bg-stone-50/30">
            <div className="flex items-center gap-1 border-r border-stone-200 pr-4">
              <button className="p-1 hover:bg-stone-200 rounded text-stone-500"><Type className="w-4 h-4" /></button>
              <button className="p-1 hover:bg-stone-200 rounded text-stone-500"><Hash className="w-4 h-4" /></button>
            </div>
            <div className="flex items-center gap-1 border-r border-stone-200 pr-4">
              <button className="p-1 hover:bg-stone-200 rounded text-stone-500"><Eye className="w-4 h-4" /></button>
              <button className="p-1 hover:bg-stone-200 rounded text-stone-500"><Maximize2 className="w-4 h-4" /></button>
            </div>
            <div className="flex items-center gap-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest">
              <span>Markdown Active</span>
              <span className="text-stone-200">|</span>
              <span>Focus Mode Off</span>
            </div>

            <div className="ml-auto flex items-center gap-3">
              <button className="flex items-center gap-1.5 text-[10px] font-bold text-stone-600 hover:text-stone-900 transition-colors">
                <Save className="w-3.5 h-3.5" />
                Auto-Save
              </button>
              <button className="flex items-center gap-1.5 px-3 py-1 bg-stone-900 text-white rounded-md text-[10px] font-bold shadow-sm hover:bg-stone-800 transition-all">
                <Download className="w-3 h-3" />
                Build Manuscript
              </button>
            </div>
          </div>

          {/* Writing Canvas */}
          <div className="flex-1 overflow-y-auto p-12 lg:p-20 flex justify-center custom-scrollbar bg-stone-50/20">
            <div className="w-full max-w-3xl">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full h-full bg-transparent border-none focus:ring-0 text-lg leading-relaxed font-serif text-stone-800 placeholder:text-stone-300 resize-none"
                placeholder="Start writing your masterpiece..."
              />
            </div>
          </div>

          {/* Status Footer */}
          <div className="h-8 border-t border-stone-200 bg-white px-6 flex items-center justify-between text-[10px] font-mono text-stone-400 shrink-0">
            <div className="flex items-center gap-4">
              <span>Lines: 12</span>
              <span>Words: 154</span>
              <span>Chars: 942</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Project Synchronized</span>
            </div>
          </div>
        </main>

        {/* Metadata / Reference Inspector */}
        <aside className="w-72 border-l border-stone-200 bg-stone-50 flex flex-col shrink-0 overflow-y-auto custom-scrollbar">
          <div className="p-4 border-b border-stone-200">
            <h3 className="text-[10px] font-black text-stone-500 uppercase tracking-widest mb-4">Metadata Inspector</h3>
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-stone-200 bg-white space-y-2">
                <div className="flex items-center gap-2 text-stone-900">
                  <Users className="w-4 h-4 text-stone-400" />
                  <h4 className="text-xs font-bold">Characters</h4>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] hover:text-stone-900 cursor-pointer">
                    <span className="font-medium">Aya Kalimah Satya Ruane</span>
                    <span className="text-stone-300">#Protagonist</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] hover:text-stone-900 cursor-pointer">
                    <span className="font-medium">The System Admin</span>
                    <span className="text-stone-300">#Mentor</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-stone-200 bg-white space-y-2">
                <div className="flex items-center gap-2 text-stone-900">
                  <Map className="w-4 h-4 text-stone-400" />
                  <h4 className="text-xs font-bold">Locations</h4>
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] font-medium hover:text-stone-900 cursor-pointer">The Local Hotspot Node</div>
                  <div className="text-[10px] font-medium hover:text-stone-900 cursor-pointer">Legislative Chambers</div>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-stone-200 bg-stone-900 text-white space-y-2 shadow-lg shadow-stone-200">
                <div className="flex items-center gap-2">
                  <Hash className="w-4 h-4 text-stone-400" />
                  <h4 className="text-xs font-bold">Cross-References</h4>
                </div>
                <div className="text-[10px] leading-relaxed opacity-80">
                  This scene links to <span className="underline cursor-pointer">Legislative Timeline</span> and <span className="underline cursor-pointer">Technical Schematic</span>.
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-6 mt-auto">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-stone-400" />
              <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Active Synopsis</span>
            </div>
            <p className="text-[11px] text-stone-500 leading-relaxed italic">
              Aya attempts to broadcast her portfolio through a local hotspot node while navigating the tightening legislative landscape of Ohio HB 249.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
};
